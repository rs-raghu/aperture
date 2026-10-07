import { afterEach, describe, expect, it } from "vitest";
import { SAFE_SETTINGS_DEFAULTS } from "@aperture/settings";
import { backupChecksum } from "@aperture/backup";

import { createPostgresBackupService, createPostgresRepositorySet } from "../src/index.js";
import { CREATED_AT, createTestDatabase, identifier, OWNER_A, UPDATED_AT } from "./postgres-test-support.js";

const databases: Array<Awaited<ReturnType<typeof createTestDatabase>>["database"]> = [];
afterEach(async () => Promise.all(databases.splice(0).map((database) => database.close())));

function backupService(executor: Awaited<ReturnType<typeof createTestDatabase>>["executor"]) {
  let sequence = 800;
  return createPostgresBackupService(executor, {
    clock: { now: () => UPDATED_AT },
    idGenerator: { generate: () => identifier(++sequence) },
  });
}

describe("PostgreSQL backup and recovery", () => {
  it("restores durable equipment usage and rolls back a rejected relationship", async () => {
    const testDatabase = await createTestDatabase(); databases.push(testDatabase.database);
    const repositories = createPostgresRepositorySet(testDatabase.executor, { health: { generateId: () => identifier(870) } });
    const equipmentId = identifier(869);
    await repositories.health.equipment.create({ id: equipmentId, ownerId: OWNER_A, name: "Synthetic shoes", category: "running_shoes", status: "active", createdAt: CREATED_AT, updatedAt: UPDATED_AT });
    const before = await repositories.health.equipment.recordUsage({ equipmentId, ownerId: OWNER_A, distance: { value: "12.3456", unit: "kilometer" } });
    const service = backupService(testDatabase.executor);
    const backup = await service.export(OWNER_A, ["health"]);
    expect(backup.features[0]!.collections.find(({ name }) => name === "equipmentUsage")!.records).toHaveLength(1);
    const deletion = await service.dryRunDeletion(OWNER_A, ["health"]);
    await service.deleteData(OWNER_A, deletion, deletion.confirmation);
    const preview = await service.dryRunRestore(OWNER_A, backup, "replace");
    await service.restore(OWNER_A, preview, preview.confirmation);
    expect(await repositories.health.equipment.getUsageSummary(equipmentId, OWNER_A)).toEqual(before);
    const restored = await service.export(OWNER_A, ["health"]);
    expect(restored.features).toEqual(backup.features);

    const invalid = {
      ...backup,
      features: backup.features.map((feature) => ({ ...feature, collections: feature.collections.map((collection) => collection.name === "equipmentUsage" ? { ...collection, records: collection.records.map((record) => ({ ...record, equipmentId: identifier(999) })) } : collection) })),
      integrity: { algorithm: "fnv1a-64" as const, digest: "" },
    };
    invalid.integrity.digest = backupChecksum(invalid);
    const invalidPreview = await service.dryRunRestore(OWNER_A, invalid, "replace");
    expect(invalidPreview.valid).toBe(true);
    await expect(service.restore(OWNER_A, invalidPreview, invalidPreview.confirmation)).rejects.toThrow();
    expect((await service.export(OWNER_A, ["health"])).features).toEqual(backup.features);
  });

  it("round-trips exact financial and settings data and excludes credential storage", async () => {
    const testDatabase = await createTestDatabase(); databases.push(testDatabase.database);
    const repositories = createPostgresRepositorySet(testDatabase.executor, { finance: { now: () => CREATED_AT } });
    const accountId = identifier(811); const categoryId = identifier(812); const transactionId = identifier(813);
    await repositories.finance.accounts.create({ id: accountId, ownerId: OWNER_A, name: "Vault", accountType: "bank", currency: "INR" });
    await repositories.finance.categories.create({ id: categoryId, ownerId: OWNER_A, name: "Recovery", kind: "expense" });
    await repositories.finance.transactions.create({ id: transactionId, ownerId: OWNER_A, accountId, categoryId, description: "Exact", transactionType: "expense", amount: { amount: "9007199254740993.12345678", currency: "INR" }, occurredAt: UPDATED_AT });
    const settings = { ...SAFE_SETTINGS_DEFAULTS, id: identifier(814), ownerId: OWNER_A, createdAt: CREATED_AT, updatedAt: UPDATED_AT };
    await repositories.settings.createPreferences(settings);

    const connection = { id: identifier(815), ownerId: OWNER_A, createdAt: CREATED_AT, updatedAt: UPDATED_AT, integrationId: "private-provider", status: "connected" };
    await testDatabase.executor.query("insert into platform.integration_connections (id, owner_id, payload, created_at, updated_at, integration_id, status) values ($1, $2, $3::jsonb, $4::timestamptz, $5::timestamptz, $6, $7)", [connection.id, OWNER_A, JSON.stringify(connection), CREATED_AT, UPDATED_AT, "private-provider", "connected"]);
    await testDatabase.executor.query("insert into platform.integration_credentials (id, owner_id, payload, created_at, updated_at, connection_id, credential_kind, ciphertext) values ($1, $2, $3::jsonb, $4::timestamptz, $5::timestamptz, $6, $7, decode('736563726574', 'hex'))", [identifier(816), OWNER_A, JSON.stringify({ secret: "must-never-export" }), CREATED_AT, UPDATED_AT, connection.id, "refresh_token"]);

    const service = backupService(testDatabase.executor);
    const backup = await service.export(OWNER_A, ["finance", "settings"]);
    expect(service.serialize(backup)).toContain("9007199254740993.12345678");
    expect(service.serialize(backup)).not.toContain("must-never-export");
    expect(service.serialize(backup)).not.toContain("refresh_token");
    expect(backup.units).toMatchObject({ currency: "INR", measurementSystem: "metric" });

    const deletion = await service.dryRunDeletion(OWNER_A, ["finance", "settings"]);
    await service.deleteData(OWNER_A, deletion, deletion.confirmation);
    expect((await repositories.finance.transactions.findMany({ ownerId: OWNER_A })).items).toEqual([]);
    expect(await repositories.settings.findPreferences(OWNER_A)).toBeNull();

    const preview = await service.dryRunRestore(OWNER_A, backup, "replace");
    expect(preview).toMatchObject({ valid: true, additions: 5, replacements: 0, deletions: 0 });
    await service.restore(OWNER_A, preview, preview.confirmation);
    expect((await repositories.finance.transactions.findById(transactionId, OWNER_A))?.amount.amount).toBe("9007199254740993.12345678");
    expect(await repositories.settings.findPreferences(OWNER_A)).toEqual(settings);
    expect(await repositories.settings.listIntegrationStatuses(OWNER_A)).toEqual([{ ...connection, status: "disconnected" }]);
    expect((await testDatabase.executor.query("select count(*)::int as count from platform.integration_credentials where owner_id = $1", [OWNER_A])).rows[0]).toEqual({ count: 0 });
    expect((await testDatabase.executor.query("select count(*)::int as count from platform.backup_manifests where owner_id = $1", [OWNER_A])).rows[0]).toEqual({ count: 1 });
  });

  it("rejects domain-invalid records before mutation and keeps current data intact", async () => {
    const testDatabase = await createTestDatabase(); databases.push(testDatabase.database);
    const repositories = createPostgresRepositorySet(testDatabase.executor, { finance: { now: () => CREATED_AT } });
    const account = await repositories.finance.accounts.create({ id: identifier(821), ownerId: OWNER_A, name: "Current", accountType: "bank", currency: "USD" });
    const service = backupService(testDatabase.executor);
    const backup = await service.export(OWNER_A, ["finance"]);
    const accountRecord = backup.features[0]!.collections.find(({ name }) => name === "accounts")!.records[0]!;
    const corrupted = structuredClone(backup) as unknown as { features: { collections: { name: string; records: Array<Record<string, unknown>> }[] }[]; integrity: { algorithm: "fnv1a-64"; digest: string } };
    (corrupted.features[0]!.collections.find(({ name }) => name === "accounts")!.records[0] as Record<string, unknown>).currency = "invalid";
    corrupted.integrity.digest = backupChecksum(corrupted as never);

    const preview = await service.dryRunRestore(OWNER_A, corrupted, "replace");
    expect(preview.valid).toBe(false);
    expect(preview.issues.some((issue) => issue.code === "backup-invalid-feature" && issue.featureId === "finance" && issue.collection === "accounts" && issue.recordId === accountRecord.id)).toBe(true);
    expect(await repositories.finance.accounts.findById(account.id, OWNER_A)).toEqual(account);
  });
});
