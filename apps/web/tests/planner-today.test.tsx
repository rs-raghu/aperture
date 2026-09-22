import { featureRegistry } from "@aperture/feature-registry";
import { createPlannerMemoryRepository, createPlannerService } from "@aperture/planner";
import { createTodayService } from "@aperture/today";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { PlannerProvider } from "@/features/planner/providers/planner-provider";
import { PlannerScreen } from "@/features/planner/screens/planner-screen";
import { TodayProvider } from "@/features/today/provider";
import { TodayScreen } from "@/features/today/screen";

const ownerId = "00000000-0000-4000-8000-000000000001";
const now = () => "2040-03-06T10:00:00.000Z";

describe("Planner and Today web workflows", () => {
  it("creates and completes a daily planner item through the real service", async () => {
    const user = userEvent.setup(); let next = 1;
    const service = createPlannerService({ repository: createPlannerMemoryRepository(), clock: { now }, idGenerator: { generate: () => `00000000-0000-4000-8000-${String(next++).padStart(12, "0")}` } });
    render(<PlannerProvider runtime={{ service, context: { ownerId }, clock: { now } }}><PlannerScreen /></PlannerProvider>);
    await screen.findByText("Nothing planned");
    await user.type(screen.getByLabelText("Title"), "Publish plan");
    await user.click(screen.getByRole("button", { name: "Add item" }));
    expect(await screen.findByText("Publish plan")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Complete" }));
    expect(await screen.findByRole("button", { name: "Reopen" })).toBeTruthy();
  });

  it("renders manifest-backed Today widgets and configurable visibility", async () => {
    const user = userEvent.setup();
    const service = createTodayService({
      widgets: featureRegistry.widgets("web"),
      contributors: [{ widgetId: "planner.items", load: async () => [{ id: "planner:1", widgetId: "planner.items", sourceFeatureId: "planner", kind: "task", title: "Prepare review", href: "/planner", priority: 4 }] }],
      quickActions: [{ id: "planner.add", label: "Add task", href: "/planner", featureId: "planner" }],
    });
    render(<TodayProvider runtime={{ service, ownerId, now }}><TodayScreen /></TodayProvider>);
    expect(await screen.findByText("Prepare review")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Add task" }).getAttribute("href")).toBe("/planner");
    await user.click(screen.getByLabelText("Planner tasks"));
    expect(screen.queryByText("Prepare review")).toBeNull();
  });
});
