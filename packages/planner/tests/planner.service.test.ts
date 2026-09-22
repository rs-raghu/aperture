import { describe, expect, it } from "vitest";
import { createPlannerMemoryRepository, createPlannerService } from "../src/index.js";

const ownerId = "00000000-0000-4000-8000-000000000001";
let nextId = 1;
const idGenerator = { generate: () => `00000000-0000-4000-8000-${String(nextId++).padStart(12, "0")}` };
const clock = { now: () => "2040-03-06T10:00:00.000Z" };

function setup() {
  nextId = 1;
  const repository = createPlannerMemoryRepository();
  return { repository, service: createPlannerService({ repository, clock, idGenerator }), context: { ownerId } };
}

describe("planner vertical slice", () => {
  it("creates plans and filters items by type, status, priority, and schedule", async () => {
    const { service, context } = setup();
    const plan = await service.createPlan(context, { title: "Launch week", planType: "week", startsOn: "2040-03-04", endsOn: "2040-03-10" });
    await service.createItem(context, { planId: plan.id, title: "Ship", itemType: "task", priority: 4, scheduledFor: "2040-03-06" });
    await service.createItem(context, { planId: plan.id, title: "Review", itemType: "event", priority: 2, scheduledFor: "2040-03-07" });
    expect((await service.listPlans(context, { planType: "week" })).items).toHaveLength(1);
    expect((await service.listItems(context, { itemType: "task", priority: 4, scheduledFrom: "2040-03-06", scheduledTo: "2040-03-06" })).items.map(({ title }) => title)).toEqual(["Ship"]);
  });

  it("completes and reopens work with matching completion timestamps", async () => {
    const { service, context } = setup();
    const item = await service.createItem(context, { title: "Finish brief", itemType: "task" });
    expect((await service.completeItem(context, item.id)).completedAt).toBe(clock.now());
    const reopened = await service.reopenItem(context, item.id);
    expect(reopened.status).toBe("planned"); expect(reopened.completedAt).toBeUndefined();
  });

  it("builds daily and weekly plans with recurring work and overdue handling", async () => {
    const { service, context } = setup();
    await service.createItem(context, { title: "Daily review", itemType: "focus", scheduledFor: "2040-03-01", recurrence: { frequency: "daily", interval: 1 } });
    await service.createItem(context, { title: "Weekly sync", itemType: "event", scheduledFor: "2040-03-04", recurrence: { frequency: "weekly", interval: 1, daysOfWeek: [1, 2] } });
    await service.createItem(context, { title: "Late task", itemType: "task", dueAt: "2040-03-05T12:00:00.000Z", priority: 4 });
    const daily = await service.getDailyPlan(context, "2040-03-06");
    expect(daily.scheduled.map(({ item }) => item.title)).toEqual(["Daily review", "Weekly sync"]);
    expect(daily.overdue.map(({ item }) => item.title)).toEqual(["Late task"]);
    const week = await service.getWeeklyPlan(context, "2040-03-06");
    expect(week.startsOn).toBe("2040-03-05"); expect(week.days).toHaveLength(7);
  });

  it("isolates owner records and paginates deterministically", async () => {
    const { service, context } = setup();
    await service.createItem(context, { title: "One", itemType: "task" });
    await service.createItem(context, { title: "Two", itemType: "task" });
    const first = await service.listItems(context, { limit: 1 });
    expect(first.items).toHaveLength(1); expect(first.nextCursor).toBe("memory:1");
    expect((await service.listItems({ ownerId: "00000000-0000-4000-8000-000000000002" })).items).toEqual([]);
  });
});
