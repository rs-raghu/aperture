import type { BackupFeatureAdapter, BackupServiceDependencies } from "./backup.adapter.js";
import { backupChecksum, checksum } from "./checksum.js";
import {
  BACKUP_FORMAT, BACKUP_PRIVACY_WARNING, BACKUP_SCHEMA_VERSION,
  type ApertureBackup, type BackupConflict, type BackupFeaturePayload, type BackupIssue,
  type BackupMetadata, type BackupScope, type BackupValidationResult, type DeletionPreview,
  type JsonObject, type LegacyApertureBackupV1, type RestorePreview, type RestoreResult,
} from "./backup.types.js";

const IDENTIFIER = /^[a-z][a-z0-9.-]*$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function recordId(record: JsonObject): string | undefined {
  return typeof record.id === "string" ? record.id : undefined;
}

function countRecords(features: readonly BackupFeaturePayload[]): number {
  return features.reduce((total, feature) => total + feature.collections.reduce((sum, collection) => sum + collection.records.length, 0), 0);
}

function scopeFor(featureIds: readonly string[], allIds: readonly string[]): BackupScope {
  return { kind: featureIds.length === allIds.length ? "full" : "features", featureIds };
}

function metadata(backup: ApertureBackup): BackupMetadata {
  return {
    backupId: backup.backupId, ownerId: backup.ownerId, schemaVersion: backup.schemaVersion,
    exportedAt: backup.exportedAt, scope: backup.scope, recordCount: backup.recordCount,
    checksum: backup.integrity.digest,
  };
}

function identityChecksum(identities: readonly { readonly featureId: string; readonly collection: string; readonly recordId: string }[]): string {
  return checksum([...identities].sort((left, right) => left.featureId.localeCompare(right.featureId) || left.collection.localeCompare(right.collection) || left.recordId.localeCompare(right.recordId)));
}

function validateEnvelope(value: Record<string, unknown>): BackupIssue[] {
  const issues: BackupIssue[] = [];
  if (value.format !== BACKUP_FORMAT) issues.push({ code: "backup-invalid-shape", message: "The file is not an Aperture backup." });
  if (typeof value.ownerId !== "string" || value.ownerId.length === 0) issues.push({ code: "backup-invalid-shape", message: "The backup owner is missing." });
  if (typeof value.backupId !== "string" || value.backupId.length === 0) issues.push({ code: "backup-invalid-shape", message: "The backup identifier is missing." });
  if (!object(value.integrity) || value.integrity.algorithm !== "fnv1a-64" || typeof value.integrity.digest !== "string") issues.push({ code: "backup-invalid-shape", message: "The backup integrity metadata is invalid." });
  return issues;
}

function readFeatures(value: unknown): readonly BackupFeaturePayload[] | null {
  if (!Array.isArray(value)) return null;
  const features: BackupFeaturePayload[] = [];
  for (const candidate of value) {
    if (!object(candidate) || typeof candidate.featureId !== "string" || !Number.isSafeInteger(candidate.schemaVersion) || !Array.isArray(candidate.collections)) return null;
    const collections = [];
    for (const collection of candidate.collections) {
      if (!object(collection) || typeof collection.name !== "string" || !Array.isArray(collection.records) || !collection.records.every(object)) return null;
      collections.push({ name: collection.name, records: collection.records as readonly JsonObject[] });
    }
    features.push({ featureId: candidate.featureId, schemaVersion: candidate.schemaVersion as number, collections });
  }
  return features;
}

function migrateV1(value: Record<string, unknown>, features: readonly BackupFeaturePayload[]): ApertureBackup {
  const exportedAt = String(value.createdAt);
  const draft = {
    format: BACKUP_FORMAT, schemaVersion: BACKUP_SCHEMA_VERSION, backupId: String(value.backupId), ownerId: String(value.ownerId),
    exportedAt, scope: { kind: "full" as const, featureIds: features.map(({ featureId }) => featureId) },
    units: object(value.units) ? value.units : {}, privacyWarning: BACKUP_PRIVACY_WARNING,
    features, recordCount: countRecords(features),
  };
  return { ...draft, integrity: { algorithm: "fnv1a-64", digest: backupChecksum({ ...draft, integrity: { algorithm: "fnv1a-64", digest: "" } }) } } as ApertureBackup;
}

export class BackupService {
  readonly #adapters: ReadonlyMap<string, BackupFeatureAdapter>;

  public constructor(private readonly dependencies: BackupServiceDependencies) {
    const adapters = new Map<string, BackupFeatureAdapter>();
    for (const adapter of dependencies.adapters) {
      if (!IDENTIFIER.test(adapter.featureId) || adapters.has(adapter.featureId)) throw new Error(`Invalid or duplicate backup feature: ${adapter.featureId}`);
      adapters.set(adapter.featureId, adapter);
    }
    this.#adapters = adapters;
  }

  public async export(ownerId: string, requestedFeatureIds?: readonly string[]): Promise<ApertureBackup> {
    const featureIds = requestedFeatureIds === undefined ? [...this.#adapters.keys()] : [...new Set(requestedFeatureIds)];
    if (featureIds.length === 0) throw new Error("At least one backup feature is required.");
    const adapters = featureIds.map((featureId) => {
      const adapter = this.#adapters.get(featureId);
      if (adapter === undefined) throw new Error(`Unknown backup feature: ${featureId}`);
      return adapter;
    });
    const features = await Promise.all(adapters.map(async (adapter): Promise<BackupFeaturePayload> => ({
      featureId: adapter.featureId, schemaVersion: adapter.schemaVersion, collections: await adapter.export(ownerId),
    })));
    const draft = {
      format: BACKUP_FORMAT, schemaVersion: BACKUP_SCHEMA_VERSION, backupId: this.dependencies.idGenerator.generate(),
      ownerId, exportedAt: this.dependencies.clock.now(), scope: scopeFor(featureIds, [...this.#adapters.keys()]),
      units: await this.dependencies.readUnits?.(ownerId) ?? {}, privacyWarning: BACKUP_PRIVACY_WARNING,
      features, recordCount: countRecords(features),
    };
    const backup: ApertureBackup = { ...draft, integrity: { algorithm: "fnv1a-64", digest: backupChecksum({ ...draft, integrity: { algorithm: "fnv1a-64", digest: "" } }) } };
    await this.dependencies.metadataRepository?.record(metadata(backup));
    return backup;
  }

  public serialize(backup: ApertureBackup): string { return JSON.stringify(backup, null, 2); }

  public async validate(source: string | unknown, expectedOwnerId?: string): Promise<BackupValidationResult> {
    let raw: unknown = source;
    if (typeof source === "string") {
      try { raw = JSON.parse(source) as unknown; }
      catch { return { valid: false, issues: [{ code: "backup-invalid-json", message: "The backup is not valid JSON." }] }; }
    }
    if (!object(raw)) return { valid: false, issues: [{ code: "backup-invalid-shape", message: "The backup must be a JSON object." }] };
    const envelopeIssues = validateEnvelope(raw);
    if (envelopeIssues.length > 0) return { valid: false, issues: envelopeIssues };
    if (raw.schemaVersion !== 1 && raw.schemaVersion !== BACKUP_SCHEMA_VERSION) return { valid: false, issues: [{ code: "backup-unsupported-version", message: `Backup schema version ${String(raw.schemaVersion)} is not supported.` }] };
    const encodedChecksum = (raw.integrity as Record<string, unknown>).digest;
    const actualChecksum = backupChecksum(raw as unknown as LegacyApertureBackupV1);
    if (encodedChecksum !== actualChecksum) return { valid: false, issues: [{ code: "backup-checksum-mismatch", message: "The backup checksum does not match its contents." }] };
    const features = readFeatures(raw.schemaVersion === 1 ? raw.domains : raw.features);
    if (features === null) return { valid: false, issues: [{ code: "backup-invalid-shape", message: "The backup feature payload is invalid." }] };
    const backup = raw.schemaVersion === 1 ? migrateV1(raw, features) : raw as unknown as ApertureBackup;
    const issues: BackupIssue[] = [];
    const featureIds = features.map(({ featureId }) => featureId);
    const scopeValid = object(backup.scope) && (backup.scope.kind === "full" || backup.scope.kind === "features")
      && Array.isArray(backup.scope.featureIds) && backup.scope.featureIds.every((value) => typeof value === "string")
      && new Set(backup.scope.featureIds).size === backup.scope.featureIds.length
      && [...backup.scope.featureIds].sort().join("\0") === [...featureIds].sort().join("\0");
    if (!ISO_DATE_TIME.test(backup.exportedAt) || !scopeValid || !object(backup.units) || typeof backup.privacyWarning !== "string" || backup.recordCount !== countRecords(features)) issues.push({ code: "backup-invalid-shape", message: "The backup metadata is inconsistent." });
    if (expectedOwnerId !== undefined && backup.ownerId !== expectedOwnerId) issues.push({ code: "backup-owner-mismatch", message: "The backup belongs to a different owner." });
    const seenFeatures = new Set<string>();
    for (const feature of features) {
      const adapter = this.#adapters.get(feature.featureId);
      if (adapter === undefined || seenFeatures.has(feature.featureId)) { issues.push({ code: "backup-unknown-feature", message: `Feature ${feature.featureId} cannot be restored safely.`, featureId: feature.featureId }); continue; }
      seenFeatures.add(feature.featureId);
      const current = feature.schemaVersion === adapter.schemaVersion ? feature : await adapter.migrate?.(feature);
      if (current === undefined || current.schemaVersion !== adapter.schemaVersion) { issues.push({ code: "backup-invalid-feature", message: `Feature ${feature.featureId} schema version ${feature.schemaVersion} is unsupported.`, featureId: feature.featureId }); continue; }
      issues.push(...await adapter.validate(backup.ownerId, current));
    }
    return { valid: issues.length === 0, ...(issues.length === 0 ? { backup } : {}), issues, ...(raw.schemaVersion === 1 ? { migratedFromVersion: 1 } : {}) };
  }

  public async dryRunRestore(ownerId: string, source: string | unknown, mode: "merge" | "replace"): Promise<RestorePreview> {
    const validation = await this.validate(source, ownerId);
    if (!validation.valid || validation.backup === undefined) return { valid: false, mode, issues: validation.issues, conflicts: [], additions: 0, replacements: 0, deletions: 0, stateChecksum: "", confirmation: "" };
    const existing = new Map<string, Set<string>>();
    const existingIdentities: Array<{ featureId: string; collection: string; recordId: string; fingerprint?: string }> = [];
    for (const feature of validation.backup.features) {
      const adapter = this.#adapters.get(feature.featureId)!;
      for (const identity of await adapter.listRecordIdentities(ownerId)) {
        const key = `${feature.featureId}/${identity.collection}`;
        const ids = existing.get(key) ?? new Set<string>(); ids.add(identity.recordId); existing.set(key, ids);
        existingIdentities.push({ featureId: feature.featureId, ...identity });
      }
    }
    const conflicts: BackupConflict[] = [];
    let additions = 0;
    const seen = new Set<string>();
    for (const feature of validation.backup.features) for (const collection of feature.collections) for (const record of collection.records) {
      const id = recordId(record)!; const key = `${feature.featureId}/${collection.name}/${id}`;
      if (seen.has(key)) conflicts.push({ featureId: feature.featureId, collection: collection.name, recordId: id, kind: "duplicate-backup-record" });
      else if (existing.get(`${feature.featureId}/${collection.name}`)?.has(id)) conflicts.push({ featureId: feature.featureId, collection: collection.name, recordId: id, kind: "existing-record" });
      else additions += 1;
      seen.add(key);
    }
    const replacements = conflicts.filter(({ kind }) => kind === "existing-record").length;
    const existingCount = [...existing.values()].reduce((sum, ids) => sum + ids.size, 0);
    const stateChecksum = identityChecksum(existingIdentities);
    const issues = mode === "merge" && conflicts.length > 0 ? [{ code: "backup-conflict" as const, message: "Merge restore has unresolved record conflicts." }] : [];
    return {
      valid: issues.length === 0, mode, backup: validation.backup, issues, conflicts, additions, replacements,
      deletions: mode === "replace" ? existingCount : 0,
      stateChecksum,
      confirmation: mode === "replace" ? `REPLACE ${ownerId} ${validation.backup.integrity.digest} ${stateChecksum}` : "",
    };
  }

  public async restore(ownerId: string, preview: RestorePreview, confirmation = ""): Promise<RestoreResult> {
    if (!preview.valid || preview.backup === undefined) throw new Error("A valid dry-run preview is required before restore.");
    if (preview.backup.ownerId !== ownerId) throw new Error("The restore preview belongs to a different owner.");
    if (preview.mode !== "merge" && preview.mode !== "replace") throw new Error("The restore mode is invalid.");
    const expectedConfirmation = `REPLACE ${ownerId} ${preview.backup.integrity.digest} ${preview.stateChecksum}`;
    if (preview.mode === "replace" && (confirmation !== expectedConfirmation || preview.confirmation !== expectedConfirmation)) throw new Error("The destructive replacement confirmation does not match the dry run.");
    const backup = preview.backup;
    const validation = await this.validate(backup, ownerId);
    if (!validation.valid) throw new Error("The backup changed or became invalid after the dry run.");
    await this.dependencies.transactionRunner.run(async (transactionAdapters) => {
      const byId = new Map(transactionAdapters.map((adapter) => [adapter.featureId, adapter]));
      const currentIdentities = [];
      for (const feature of backup.features) {
        const adapter = byId.get(feature.featureId);
        if (adapter === undefined) throw new Error(`Feature ${feature.featureId} is unavailable in the transaction.`);
        for (const identity of await adapter.listRecordIdentities(ownerId)) currentIdentities.push({ featureId: feature.featureId, ...identity });
      }
      if (identityChecksum(currentIdentities) !== preview.stateChecksum) throw new Error("Owner data changed after the restore dry run. Run the preview again.");
      for (const feature of backup.features) {
        const adapter = byId.get(feature.featureId)!;
        const current = feature.schemaVersion === adapter.schemaVersion ? feature : await adapter.migrate?.(feature);
        if (current === undefined || (await adapter.validate(ownerId, current)).length > 0) throw new Error("The backup cannot be validated in the restore transaction.");
        if (preview.mode === "merge") for (const collection of current.collections) for (const record of collection.records) {
          if (currentIdentities.some((identity) => identity.featureId === feature.featureId && identity.collection === collection.name && identity.recordId === record.id)) throw new Error("Merge restore has unresolved record conflicts.");
        }
      }
      for (const feature of backup.features) {
        const adapter = byId.get(feature.featureId);
        if (adapter === undefined) throw new Error(`Feature ${feature.featureId} is unavailable in the transaction.`);
        const current = feature.schemaVersion === adapter.schemaVersion ? feature : await adapter.migrate?.(feature);
        if (current === undefined) throw new Error(`Feature ${feature.featureId} cannot be migrated.`);
        if (preview.mode === "replace") await adapter.replace(ownerId, current); else await adapter.merge(ownerId, current);
      }
    });
    return { backupId: backup.backupId, restoredAt: this.dependencies.clock.now(), recordCount: backup.recordCount, featureIds: backup.scope.featureIds };
  }

  public async dryRunDeletion(ownerId: string, featureIds?: readonly string[]): Promise<DeletionPreview> {
    const selected = [...(featureIds ?? [...this.#adapters.keys()])];
    if (selected.length === 0 || new Set(selected).size !== selected.length) throw new Error("Deletion requires a nonempty, unique feature selection.");
    let recordCount = 0;
    const identities = [];
    for (const featureId of selected) {
      const adapter = this.#adapters.get(featureId); if (adapter === undefined) throw new Error(`Unknown backup feature: ${featureId}`);
      const current = await adapter.listRecordIdentities(ownerId);
      recordCount += current.length;
      for (const identity of current) identities.push({ featureId, ...identity });
    }
    const stateChecksum = identityChecksum(identities);
    return { ownerId, featureIds: selected, recordCount, stateChecksum, confirmation: `DELETE ${ownerId} ${selected.join(",")} ${recordCount} ${stateChecksum}` };
  }

  public async deleteData(ownerId: string, preview: DeletionPreview, confirmation: string): Promise<void> {
    if (preview.ownerId !== ownerId) throw new Error("The deletion preview belongs to a different owner.");
    if (preview.featureIds.length === 0 || new Set(preview.featureIds).size !== preview.featureIds.length) throw new Error("Deletion requires a nonempty, unique feature selection.");
    const expectedConfirmation = `DELETE ${ownerId} ${preview.featureIds.join(",")} ${preview.recordCount} ${preview.stateChecksum}`;
    if (confirmation !== expectedConfirmation || preview.confirmation !== expectedConfirmation) throw new Error("The destructive deletion confirmation does not match the dry run.");
    await this.dependencies.transactionRunner.run(async (transactionAdapters) => {
      const byId = new Map(transactionAdapters.map((adapter) => [adapter.featureId, adapter]));
      const currentIdentities = [];
      for (const featureId of preview.featureIds) {
        const adapter = byId.get(featureId); if (adapter === undefined) throw new Error(`Feature ${featureId} is unavailable in the transaction.`);
        for (const identity of await adapter.listRecordIdentities(ownerId)) currentIdentities.push({ featureId, ...identity });
      }
      if (identityChecksum(currentIdentities) !== preview.stateChecksum) throw new Error("Owner data changed after the deletion dry run. Run the preview again.");
      for (const featureId of preview.featureIds) {
        const adapter = byId.get(featureId); if (adapter === undefined) throw new Error(`Feature ${featureId} is unavailable in the transaction.`);
        await adapter.deleteAll(ownerId);
      }
    });
  }
}

export function createBackupService(dependencies: BackupServiceDependencies): BackupService { return new BackupService(dependencies); }
