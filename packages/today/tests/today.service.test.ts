import { describe, expect, it } from "vitest";
import { createTodayService, type TodayContributor, type TodayWidgetDefinition } from "../src/index.js";

const widgets: TodayWidgetDefinition[] = [
  { id: "planner.items", featureId: "planner", featureName: "Planner", title: "Plan", description: "Tasks", order: 10, defaultEnabled: true },
  { id: "education.deadlines", featureId: "education", featureName: "Education", title: "Deadlines", description: "Due soon", order: 20, defaultEnabled: true },
  { id: "health.plans", featureId: "health", featureName: "Health", title: "Health", description: "Plans", order: 30, defaultEnabled: false },
];

describe("Today aggregation", () => {
  it("loads enabled widgets in manifest order and summarizes overdue work", async () => {
    const contributors: TodayContributor[] = [
      { widgetId: "education.deadlines", load: async () => [{ id: "e1", widgetId: "education.deadlines", sourceFeatureId: "education", kind: "deadline", title: "Essay", href: "/education", overdue: true }] },
      { widgetId: "planner.items", load: async () => [{ id: "p1", widgetId: "planner.items", sourceFeatureId: "planner", kind: "task", title: "Plan", href: "/planner", priority: 4 }] },
    ];
    const dashboard = await createTodayService({ widgets, contributors, quickActions: [] }).getDashboard({ ownerId: "owner", date: "2040-03-06" });
    expect(dashboard.widgets.map(({ definition }) => definition.id)).toEqual(["planner.items", "education.deadlines"]);
    expect(dashboard.totalItems).toBe(2); expect(dashboard.overdueItems).toBe(1);
  });

  it("applies widget configuration and isolates contributor failures", async () => {
    const service = createTodayService({ widgets, contributors: [{ widgetId: "health.plans", load: async () => { throw new Error("offline"); } }], quickActions: [] });
    const dashboard = await service.getDashboard({ ownerId: "owner", date: "2040-03-06", enabledWidgetIds: ["health.plans"] });
    expect(dashboard.widgets).toHaveLength(1); expect(dashboard.widgets[0]?.state).toBe("unavailable");
  });

  it("rejects duplicate contributor registrations", () => {
    const duplicate: TodayContributor = { widgetId: "planner.items", load: async () => [] };
    expect(() => createTodayService({ widgets, contributors: [duplicate, duplicate], quickActions: [] })).toThrow(/unique/);
  });
});
