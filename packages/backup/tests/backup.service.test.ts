import { describe, expect, it } from "vitest";

import {
  BACKUP_FORMAT,
  BACKUP_PRIVACY_WARNING,
  backupChecksum,
  checksum,
  stableSerialize,
  createBackupService,
  type ApertureBackup,
  type BackupFeatureAdapter,
  type BackupFeaturePayload,
  type BackupIssue,
  type JsonObject,
  type LegacyApertureBackupV1,
} from "../src/index.js";

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_OWNER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const NOW = "2040-05-06T07:08:09.000Z";

type State = Map<string, Map<string, JsonObject>>;

function cloneState(state: State): State {
  return new Map([...state].map(([feature, records]) => [feature, new Map([...records].map(([id, record]) => [id, structuredClone(record)]))]));
}

function record(id: string, ownerId = OWNER, extra: JsonObject = {}): JsonObject {
  return { id, ownerId, createdAt: NOW, updatedAt: NOW, ...extra };
}

function adapter(featureId: string, state: State, failRestore = false): BackupFeatureAdapter {
  const records = () => state.get(featureId) ?? new Map<string, JsonObject>();
  const validate = async (ownerId: string, payload: BackupFeaturePayload): Promise<readonly BackupIssue[]> => {
    const collection = payload.collections[0];
    if (collection?.name !== "records") return [{ code: "backup-invalid-feature", message: "records missing", featureId }];
    return collection.records.flatMap((value) => value.ownerId === ownerId && typeof value.id === "string" ? [] : [{ code: "backup-invalid-feature" as const, message: "invalid record", featureId }]);
  };
  const merge = async (_ownerId: string, payload: BackupFeaturePayload) => {
    const target = records();
    state.set(featureId, target);
    for (const value of payload.collections[0]!.records) {
      target.set(String(value.id), structuredClone(value));
      if (failRestore) throw new Error("synthetic restore failure");
    }
  };
  return {
    featureId, schemaVersion: 1,
    async export(ownerId) { return [{ name: "records", records: [...records().values()].filter((value) => value.ownerId === ownerId).map((value) => structuredClone(value)) }]; },
    validate,
    async listRecordIdentities(ownerId) { return [...records().values()].filter((value) => value.ownerId === ownerId).map((value) => ({ collection: "records", recordId: String(value.id), fingerprint: checksum(value) })); },
    async replace(ownerId, payload) { await this.deleteAll(ownerId); await merge(ownerId, payload); },
    merge,
    async deleteAll(ownerId) { for (const [id, value] of records()) if (value.ownerId === ownerId) records().delete(id); },
  };
}

function harness(initial: State, failingFeature?: string) {
  let durable = cloneState(initial);
  const makeAdapters = (state: State) => [adapter("finance", state), adapter("health", state, failingFeature === "health")];
  let id = 0;
  const service = createBackupService({
    adapters: makeAdapters(durable),
    clock: { now: () => NOW }, idGenerator: { generate: () => `backup-${++id}` },
    readUnits: async () => ({ currency: "INR", measurementSystem: "metric", massUnit: "kilograms" }),
    transactionRunner: {
      async run(work) {
        const transactionState = cloneState(durable);
        const result = await work(makeAdapters(transactionState));
        durable.clear();
        for (const [featureId, records] of transactionState) durable.set(featureId, records);
        return result;
      },
    },
  });
  return { service, state: () => durable };
}

describe("BackupService", () => {
  it("canonicalizes keys without device-locale ordering and hashes UTF-8 text", () => {
    const value = { b: "தமிழ் 🌙", a: "₹", Z: 3 };
    expect(stableSerialize(value)).toBe('{"Z":3,"a":"₹","b":"தமிழ் 🌙"}');
    expect(checksum(value)).toBe(checksum({ Z: 3, a: "₹", b: "தமிழ் 🌙" }));
    let reference = 0xcbf29ce484222325n;
    for (const byte of new TextEncoder().encode(stableSerialize(value))) reference = BigInt.asUintN(64, (reference ^ BigInt(byte)) * 0x100000001b3n);
    expect(checksum(value)).toBe(reference.toString(16).padStart(16, "0"));
  });

  it("exports full and feature-scoped versioned archives without secrets and preserves exact money", async () => {
    const state: State = new Map([
      ["finance", new Map([["money-1", record("money-1", OWNER, { amount: { amount: "9007199254740993.12345678", currency: "INR" } })]])],
      ["health", new Map([["health-1", record("health-1", OWNER, { weight: { value: "70.25", unit: "kilograms" } })]])],
    ]);
    const { service } = harness(state);
    const full = await service.export(OWNER);
    const scoped = await service.export(OWNER, ["finance"]);

    expect(full).toMatchObject({ format: BACKUP_FORMAT, schemaVersion: 2, ownerId: OWNER, recordCount: 2, privacyWarning: BACKUP_PRIVACY_WARNING, units: { currency: "INR", massUnit: "kilograms" } });
    expect(scoped.scope).toEqual({ kind: "features", featureIds: ["finance"] });
    expect(service.serialize(full)).toContain("9007199254740993.12345678");
    expect(service.serialize(full)).not.toMatch(/access[_-]?token|refresh[_-]?token|client[_-]?secret/i);
    expect((await service.validate(full, OWNER)).valid).toBe(true);
  });

  it("round-trips synthetic records and reports conflicts before confirmed replacement", async () => {
    const source = harness(new Map([
      ["finance", new Map([["money-1", record("money-1", OWNER, { amount: { amount: "1.00000001", currency: "USD" } })]])],
      ["health", new Map([["health-1", record("health-1")]])],
    ]));
    const backup = await source.service.export(OWNER);
    const target = harness(new Map([
      ["finance", new Map([["money-1", record("money-1", OWNER, { amount: { amount: "99", currency: "USD" } })]])],
      ["health", new Map([["obsolete", record("obsolete")]])],
    ]));
    const merge = await target.service.dryRunRestore(OWNER, backup, "merge");
    expect(merge.valid).toBe(false);
    expect(merge.conflicts).toContainEqual({ featureId: "finance", collection: "records", recordId: "money-1", kind: "existing-record" });

    const replacement = await target.service.dryRunRestore(OWNER, backup, "replace");
    await expect(target.service.restore(OTHER_OWNER, replacement, replacement.confirmation)).rejects.toThrow(/different owner/);
    await expect(target.service.restore(OWNER, replacement, "wrong confirmation")).rejects.toThrow(/confirmation/);
    await expect(target.service.restore(OWNER, { ...replacement, confirmation: "" })).rejects.toThrow(/confirmation/);
    target.state().get("finance")!.set("money-1", record("money-1", OWNER, { note: "edited after preview" }));
    await expect(target.service.restore(OWNER, replacement, replacement.confirmation)).rejects.toThrow(/changed after the restore dry run/);
    target.state().get("health")!.set("late-change", record("late-change"));
    await expect(target.service.restore(OWNER, replacement, replacement.confirmation)).rejects.toThrow(/changed after the restore dry run/);
    const currentReplacement = await target.service.dryRunRestore(OWNER, backup, "replace");
    await target.service.restore(OWNER, currentReplacement, currentReplacement.confirmation);
    const roundTrip = await target.service.export(OWNER);
    expect(roundTrip.features.map(({ collections }) => collections[0]!.records)).toEqual(backup.features.map(({ collections }) => collections[0]!.records));
  });

  it("rejects corrupted, cross-owner, future-version, and malformed backups before mutation", async () => {
    const state = new Map([["finance", new Map([["money-1", record("money-1")]])], ["health", new Map<string, JsonObject>()]]);
    const { service } = harness(state);
    const backup = await service.export(OWNER);
    const corrupted = structuredClone(backup) as unknown as { features: { collections: { records: JsonObject[] }[] }[] };
    (corrupted.features[0]!.collections[0]!.records[0]! as Record<string, unknown>).updatedAt = "tampered";
    expect((await service.validate(corrupted)).issues[0]?.code).toBe("backup-checksum-mismatch");
    expect((await service.validate(backup, OTHER_OWNER)).issues[0]?.code).toBe("backup-owner-mismatch");

    const future = { ...backup, schemaVersion: 99, integrity: { algorithm: "fnv1a-64" as const, digest: "" } };
    future.integrity.digest = backupChecksum(future as unknown as ApertureBackup);
    expect((await service.validate(future)).issues[0]?.code).toBe("backup-unsupported-version");
    expect((await service.validate("{broken")).issues[0]?.code).toBe("backup-invalid-json");
  });

  it("migrates a valid version 1 archive and safely ignores additive envelope fields", async () => {
    const { service } = harness(new Map([["finance", new Map([["money-1", record("money-1")]])], ["health", new Map<string, JsonObject>()]]));
    const current = await service.export(OWNER);
    const draft = {
      format: BACKUP_FORMAT, schemaVersion: 1 as const, backupId: current.backupId, ownerId: OWNER,
      createdAt: current.exportedAt, domains: current.features, units: current.units, futureNote: "safe to ignore",
    };
    const legacy = { ...draft, integrity: { algorithm: "fnv1a-64" as const, digest: backupChecksum({ ...draft, integrity: { algorithm: "fnv1a-64", digest: "" } } as LegacyApertureBackupV1) } };
    const result = await service.validate(legacy, OWNER);
    expect(result).toMatchObject({ valid: true, migratedFromVersion: 1, backup: { schemaVersion: 2, privacyWarning: BACKUP_PRIVACY_WARNING } });
  });

  it("rolls back a failed multi-feature restore and applies confirmed deletion atomically", async () => {
    const source = harness(new Map([["finance", new Map([["new-finance", record("new-finance")]])], ["health", new Map([["new-health", record("new-health")]])]]));
    const backup = await source.service.export(OWNER);
    const target = harness(new Map([["finance", new Map([["old-finance", record("old-finance")]])], ["health", new Map([["old-health", record("old-health")]])]]), "health");
    const preview = await target.service.dryRunRestore(OWNER, backup, "replace");
    await expect(target.service.restore(OWNER, preview, preview.confirmation)).rejects.toThrow("synthetic restore failure");
    expect([...target.state().get("finance")!.keys()]).toEqual(["old-finance"]);
    expect([...target.state().get("health")!.keys()]).toEqual(["old-health"]);

    const healthy = harness(target.state());
    const deletion = await healthy.service.dryRunDeletion(OWNER, ["finance", "health"]);
    await expect(healthy.service.deleteData(OTHER_OWNER, deletion, deletion.confirmation)).rejects.toThrow(/different owner/);
    await expect(healthy.service.deleteData(OWNER, deletion, "wrong")).rejects.toThrow(/confirmation/);
    healthy.state().get("finance")!.set("late-change", record("late-change"));
    await expect(healthy.service.deleteData(OWNER, deletion, deletion.confirmation)).rejects.toThrow(/changed after the deletion dry run/);
    const currentDeletion = await healthy.service.dryRunDeletion(OWNER, ["finance", "health"]);
    await healthy.service.deleteData(OWNER, currentDeletion, currentDeletion.confirmation);
    expect(deletion.recordCount).toBe(2);
    expect([...healthy.state().values()].every((records) => records.size === 0)).toBe(true);
  });
});
