import { describe, expect, it } from "vitest";
import { createSettingsMemoryRepository, createSettingsService, type IntegrationStatus } from "../src/index.js";

const OWNER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_OWNER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const NOW = "2040-04-01T08:00:00.000Z";

function service(integrations: readonly IntegrationStatus[] = []) {
  let sequence = 701;
  return createSettingsService({
    repository: createSettingsMemoryRepository(integrations), clock: { now: () => NOW },
    idGenerator: { generate: () => `00000000-0000-4000-8000-${String(sequence++).padStart(12, "0")}` },
    protectedFeatureIds: ["today", "settings"],
    knownFeatureIds: ["today", "education", "health", "settings"],
    knownWidgetIds: ["education.deadlines", "health.plans"],
  });
}

describe("Settings service", () => {
  it("creates owner-scoped privacy-safe defaults", async () => {
    const settings = service();
    const preferences = await settings.getSettings({ ownerId: OWNER });
    expect(preferences).toMatchObject({ ownerId: OWNER, theme: "system", locale: "en-IN", currency: "INR", privacy: { usageAnalytics: false, crashReports: false, personalizedInsights: false, integrationDataSharing: false } });
    expect((await settings.getSettings({ ownerId: OTHER_OWNER })).ownerId).toBe(OTHER_OWNER);
  });

  it("updates portable and platform-specific settings without crossing scopes", async () => {
    const settings = service();
    await settings.updateSettings({ ownerId: OWNER }, { theme: "dark", currency: "usd", units: { measurementSystem: "imperial", distanceUnit: "miles" }, featureEnablement: { education: false }, dashboardWidgets: { "health.plans": false } });
    const updated = await settings.updatePlatformSettings({ ownerId: OWNER }, "mobile", { haptics: false });
    expect(updated).toMatchObject({ theme: "dark", currency: "USD", units: { measurementSystem: "imperial", distanceUnit: "miles" }, featureEnablement: { education: false }, dashboardWidgets: { "health.plans": false }, platform: { web: { compactNavigation: false }, mobile: { haptics: false } } });
  });

  it("protects core features and rejects unknown manifest identifiers", async () => {
    const settings = service();
    await expect(settings.updateSettings({ ownerId: OWNER }, { featureEnablement: { settings: false } })).rejects.toThrow(/cannot be disabled/);
    await expect(settings.updateSettings({ ownerId: OWNER }, { featureEnablement: { mystery: false } })).rejects.toThrow(/Unknown feature/);
    await expect(settings.updateSettings({ ownerId: OWNER }, { dashboardWidgets: { "mystery.widget": false } })).rejects.toThrow(/Unknown widget/);
  });

  it("returns sanitized integration metadata without a credential surface", async () => {
    const integration = { id: "00000000-0000-4000-8000-000000000702", ownerId: OWNER, createdAt: NOW, updatedAt: NOW, integrationId: "strava", status: "connected", connectedAt: NOW } as const;
    const snapshot = await service([integration]).getClientSnapshot({ ownerId: OWNER });
    expect(snapshot.integrations).toEqual([integration]);
    expect(JSON.stringify(snapshot)).not.toMatch(/credential|ciphertext|token|secret/i);
  });
});
