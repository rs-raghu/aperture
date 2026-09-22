import { describe, expect, it } from "vitest";
import {
  FeatureRegistryValidationError,
  createFeatureRegistry,
  featureRegistry,
  generatedFeatureManifests,
  type FeatureManifest,
} from "../src/index.js";

function manifest(id: string, path: string): FeatureManifest {
  return {
    schemaVersion: 1,
    id,
    displayName: id,
    description: `${id} description`,
    version: "1.0.0",
    status: "enabled",
    defaultEnabled: true,
    disableAllowed: true,
    order: 1,
    icon: "circle",
    theme: { accent: "#123456", surface: "#abcdef" },
    permissions: [{ id: `${id}.read`, description: "Read", required: true }],
    routes: [{ id: `${id}.overview`, label: id, description: "Overview", paths: { web: path, mobile: path }, navigation: "primary", order: 1, searchable: true, requiresSession: true }],
    widgets: [],
    calculatorModules: [],
    frontends: {},
    migrations: [],
  };
}

describe("feature registry", () => {
  it("publishes generated navigation, searchable routes, widgets, permissions, modules, and migrations", () => {
    expect(generatedFeatureManifests.map(({ id }) => id)).toEqual(["today", "education", "health", "finance", "planner", "calculators", "settings"]);
    expect(featureRegistry.navigation("web").map(({ path }) => path)).toEqual(["/today", "/education", "/health", "/finance", "/planner", "/calculators", "/settings"]);
    expect(featureRegistry.search("assignment", "web").map(({ id }) => id)).toEqual(["education.assignments"]);
    expect(featureRegistry.widgets("mobile").map(({ id }) => id)).toEqual(["planner.items", "education.deadlines", "education.study", "health.plans", "finance.reminders"]);
    expect(featureRegistry.getFeature("education")?.permissions.map(({ id }) => id)).toContain("education.write");
    expect(featureRegistry.getFeature("calculators")?.calculatorModules.map(({ id }) => id)).toEqual(["calculators.shared"]);
    expect(featureRegistry.getFeature("health")?.migrations).toEqual(["packages/health/migrations/20260921002000_health.sql"]);
  });

  it("applies enablement overrides without disabling required features", () => {
    expect(featureRegistry.navigation("web", { education: false, today: false }).map(({ featureId }) => featureId)).toEqual(["today", "health", "finance", "planner", "calculators", "settings"]);
    expect(featureRegistry.isEnabled("education", { education: false })).toBe(false);
    expect(featureRegistry.isEnabled("settings", { settings: false })).toBe(true);
  });

  it("matches static and generated dynamic routes", () => {
    expect(featureRegistry.findRoute("web", "/health/workouts")?.id).toBe("health.workouts");
    expect(featureRegistry.findRoute("mobile", "/calculators/emi")?.id).toBe("calculators.detail");
    expect(featureRegistry.findRoute("web", "/missing")).toBeUndefined();
  });

  it("rejects duplicate feature IDs", () => {
    expect(() => createFeatureRegistry([manifest("notes", "/notes"), manifest("notes", "/other")])).toThrowError(FeatureRegistryValidationError);
    expect(() => createFeatureRegistry([manifest("notes", "/notes"), manifest("notes", "/other")])).toThrowError(/Duplicate feature ID: notes/);
  });

  it("rejects duplicate route paths and contribution IDs", () => {
    const first = manifest("notes", "/notes");
    const second = { ...manifest("journal", "/notes"), widgets: [{ id: "shared.widget", title: "A", description: "A", platforms: ["web"] as const, order: 1, defaultEnabled: true }] };
    const third = { ...manifest("planner", "/planner"), widgets: [{ id: "shared.widget", title: "B", description: "B", platforms: ["web"] as const, order: 2, defaultEnabled: true }] };
    expect(() => createFeatureRegistry([first, second, third])).toThrowError(/Duplicate web route path: \/notes/);
    expect(() => createFeatureRegistry([first, second, third])).toThrowError(/Duplicate widget ID: shared.widget/);
  });
});
