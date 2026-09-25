import { afterEach, describe, expect, it } from "vitest";
import { SAFE_SETTINGS_DEFAULTS } from "@aperture/settings";
import { createSettingsPostgresRepository } from "../src/index.js";
import { CREATED_AT, createTestDatabase, identifier, OWNER_A, OWNER_B, UPDATED_AT } from "./postgres-test-support.js";

const databases: Array<Awaited<ReturnType<typeof createTestDatabase>>["database"]> = [];
afterEach(async () => Promise.all(databases.splice(0).map((database) => database.close())));

describe("Settings PostgreSQL repository", () => {
  it("persists one rich preference aggregate per owner with isolation", async () => {
    const testDatabase = await createTestDatabase(); databases.push(testDatabase.database);
    const repository = createSettingsPostgresRepository(testDatabase.executor);
    const settings = { ...SAFE_SETTINGS_DEFAULTS, id: identifier(701), ownerId: OWNER_A, createdAt: CREATED_AT, updatedAt: CREATED_AT, featureEnablement: { education: false }, dashboardWidgets: { "health.plans": false } };
    await repository.createPreferences(settings);
    expect(await repository.findPreferences(OWNER_A)).toEqual(settings);
    expect(await repository.findPreferences(OWNER_B)).toBeNull();
    const updated = { ...settings, theme: "dark" as const, updatedAt: UPDATED_AT, privacy: { ...settings.privacy, crashReports: true } };
    await repository.updatePreferences(updated);
    expect(await repository.findPreferences(OWNER_A)).toEqual(updated);
  });

  it("lists connection metadata without querying credential records", async () => {
    const testDatabase = await createTestDatabase(); databases.push(testDatabase.database);
    const repository = createSettingsPostgresRepository(testDatabase.executor);
    const integration = { id: identifier(702), ownerId: OWNER_A, createdAt: CREATED_AT, updatedAt: UPDATED_AT, integrationId: "strava", status: "connected" as const, connectedAt: UPDATED_AT };
    await testDatabase.executor.query("insert into platform.integration_connections (id, owner_id, payload, created_at, updated_at, integration_id, status, connected_at) values ($1, $2, $3::jsonb, $4::timestamptz, $5::timestamptz, $6, $7, $8::timestamptz)", [integration.id, OWNER_A, JSON.stringify(integration), CREATED_AT, UPDATED_AT, "strava", "connected", UPDATED_AT]);
    expect(await repository.listIntegrationStatuses(OWNER_A)).toEqual([integration]);
    expect(await repository.listIntegrationStatuses(OWNER_B)).toEqual([]);
  });
});
