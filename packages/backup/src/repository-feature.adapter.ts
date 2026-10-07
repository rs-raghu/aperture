import type { BackupFeatureAdapter, BackupRecordIdentity } from "./backup.adapter.js";
import type { BackupCollection, BackupFeaturePayload, BackupIssue, JsonObject } from "./backup.types.js";
import { checksum } from "./checksum.js";

export interface BackupCrudPage { readonly items: readonly unknown[]; readonly nextCursor?: string; }
export interface BackupCrudRepository {
  create(input: unknown): Promise<unknown>;
  delete?(id: string, ownerId: string): Promise<void>;
  findMany?(query: { readonly ownerId: string; readonly cursor?: string; readonly limit?: number }): Promise<BackupCrudPage>;
}

export interface BackupCollectionDefinition {
  readonly name: string;
  readonly repository: BackupCrudRepository;
  readonly validate?: (record: unknown) => boolean;
  readonly list?: (ownerId: string) => Promise<readonly unknown[]>;
}

function jsonRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function allRecords(definition: BackupCollectionDefinition, ownerId: string): Promise<readonly JsonObject[]> {
  if (definition.list !== undefined) {
    const listed = await definition.list(ownerId);
    if (!listed.every(jsonRecord)) throw new Error("A repository returned a non-object backup record.");
    return listed.map((item) => structuredClone(item as JsonObject));
  }
  const repository = definition.repository;
  if (repository.findMany === undefined) throw new Error(`The ${definition.name} repository cannot enumerate backup records.`);
  const records: JsonObject[] = [];
  let cursor: string | undefined;
  do {
    const page = await repository.findMany({ ownerId, ...(cursor === undefined ? {} : { cursor }), limit: 100 });
    for (const item of page.items) {
      if (!jsonRecord(item)) throw new Error("A repository returned a non-object backup record.");
      records.push(structuredClone(item));
    }
    cursor = page.nextCursor;
  } while (cursor !== undefined);
  return records;
}

export function createRepositoryFeatureAdapter(
  featureId: string,
  collections: readonly BackupCollectionDefinition[],
  schemaVersion = 1,
): BackupFeatureAdapter {
  const byName = new Map(collections.map((collection) => [collection.name, collection]));

  async function exported(ownerId: string): Promise<readonly BackupCollection[]> {
    return Promise.all(collections.map(async (definition) => ({ name: definition.name, records: await allRecords(definition, ownerId) })));
  }

  async function validate(ownerId: string, payload: BackupFeaturePayload): Promise<readonly BackupIssue[]> {
    const issues: BackupIssue[] = [];
    const names = new Set<string>();
    for (const collection of payload.collections) {
      const definition = byName.get(collection.name);
      if (definition === undefined || names.has(collection.name)) {
        issues.push({ code: "backup-invalid-feature", message: `Unknown or duplicate ${featureId} collection: ${collection.name}.`, featureId, collection: collection.name });
        continue;
      }
      names.add(collection.name);
      const ids = new Set<string>();
      for (const record of collection.records) {
        const id = typeof record.id === "string" ? record.id : undefined;
        const recordOwner = typeof record.ownerId === "string" ? record.ownerId : undefined;
        const timestampsValid = typeof record.createdAt === "string" && typeof record.updatedAt === "string"
          && !Number.isNaN(Date.parse(record.createdAt)) && !Number.isNaN(Date.parse(record.updatedAt));
        if (id === undefined || recordOwner !== ownerId || !timestampsValid || definition.validate?.(record) === false) {
          issues.push({ code: "backup-invalid-feature", message: `A ${featureId}/${collection.name} record is invalid.`, featureId, collection: collection.name, ...(id === undefined ? {} : { recordId: id }) });
        } else if (ids.has(id)) {
          issues.push({ code: "backup-duplicate-record", message: `Duplicate record ${id} in ${featureId}/${collection.name}.`, featureId, collection: collection.name, recordId: id });
        }
        if (id !== undefined) ids.add(id);
      }
    }
    for (const { name } of collections) if (!names.has(name)) issues.push({ code: "backup-invalid-feature", message: `The ${featureId}/${name} collection is missing.`, featureId, collection: name });
    return issues;
  }

  async function listRecordIdentities(ownerId: string): Promise<readonly BackupRecordIdentity[]> {
    const result: BackupRecordIdentity[] = [];
    for (const collection of await exported(ownerId)) for (const record of collection.records) result.push({ collection: collection.name, recordId: String(record.id), fingerprint: checksum(record) });
    return result;
  }

  async function deleteAll(ownerId: string): Promise<void> {
    for (const collection of [...collections].reverse()) {
      const records = await allRecords(collection, ownerId);
      if (records.length > 0 && collection.repository.delete === undefined) throw new Error(`The ${collection.name} repository cannot delete backup records.`);
      for (const record of [...records].reverse()) await collection.repository.delete!(String(record.id), ownerId);
    }
  }

  async function merge(ownerId: string, payload: BackupFeaturePayload): Promise<void> {
    for (const definition of collections) {
      const collection = payload.collections.find(({ name }) => name === definition.name)!;
      for (const record of collection.records) {
        if (record.ownerId !== ownerId) throw new Error("A restore record changed owners after validation.");
        await definition.repository.create(structuredClone(record));
      }
    }
  }

  return Object.freeze({
    featureId, schemaVersion, export: exported, validate, listRecordIdentities,
    async replace(ownerId: string, payload: BackupFeaturePayload) { await deleteAll(ownerId); await merge(ownerId, payload); },
    merge, deleteAll,
  });
}
