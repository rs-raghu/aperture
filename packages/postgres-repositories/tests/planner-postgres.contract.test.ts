import { afterEach, describe, expect, it } from "vitest";
import { createPlannerPostgresRepository } from "../src/index.js";
import { CREATED_AT, createTestDatabase, identifier, OWNER_A, OWNER_B, UPDATED_AT } from "./postgres-test-support.js";

const databases: Array<Awaited<ReturnType<typeof createTestDatabase>>["database"]> = [];
afterEach(async () => Promise.all(databases.splice(0).map((database) => database.close())));

describe("Planner PostgreSQL repository", () => {
  it("persists plans, recurring items, and feature links with owner isolation", async () => {
    const testDatabase = await createTestDatabase(); databases.push(testDatabase.database);
    const repository = createPlannerPostgresRepository(testDatabase.executor);
    const plan = { id: identifier(601), ownerId: OWNER_A, createdAt: CREATED_AT, updatedAt: UPDATED_AT, title: "Launch week", planType: "week", startsOn: "2040-03-05", endsOn: "2040-03-11", status: "active" } as const;
    const item = { id: identifier(602), ownerId: OWNER_A, createdAt: CREATED_AT, updatedAt: UPDATED_AT, planId: plan.id, title: "Weekly review", itemType: "task", status: "planned", scheduledFor: "2040-03-06", priority: 3, recurrence: { frequency: "weekly", interval: 1, daysOfWeek: [2] as number[] } } as const;
    const link = { id: identifier(603), ownerId: OWNER_A, createdAt: CREATED_AT, updatedAt: UPDATED_AT, plannerItemId: item.id, targetScope: "education", targetId: identifier(604) } as const;
    await repository.plans.create(plan); await repository.items.create(item); await repository.itemLinks.create(link);
    expect(await repository.items.findById(item.id, OWNER_A)).toEqual(item);
    expect(await repository.items.findById(item.id, OWNER_B)).toBeNull();
    expect((await repository.items.findMany({ ownerId: OWNER_A, planId: plan.id, priority: 3 })).items).toEqual([item]);
    expect((await repository.itemLinks.findMany({ ownerId: OWNER_A, targetScope: "education" })).items).toEqual([link]);
  });

  it("preserves completion metadata and filters durable schedules", async () => {
    const testDatabase = await createTestDatabase(); databases.push(testDatabase.database);
    const repository = createPlannerPostgresRepository(testDatabase.executor);
    const item = { id: identifier(605), ownerId: OWNER_A, createdAt: CREATED_AT, updatedAt: UPDATED_AT, title: "Submit", itemType: "task", status: "completed", scheduledFor: "2040-03-06", dueAt: "2040-03-06T12:00:00.000Z", priority: 4, completedAt: UPDATED_AT } as const;
    await repository.items.create(item);
    expect((await repository.items.findMany({ ownerId: OWNER_A, status: "completed", scheduledFrom: "2040-03-01", scheduledTo: "2040-03-10" })).items).toEqual([item]);
  });
});
