import { afterEach, describe, expect, it } from "vitest";

import { createHealthPostgresRepository } from "../src/index.js";
import { CREATED_AT, createTestDatabase, identifier, OWNER_A, OWNER_B, UPDATED_AT } from "./postgres-test-support.js";

interface RuntimeEntity extends Readonly<Record<string, unknown>> {
  readonly id: string;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface RuntimeRepository {
  create(entity: RuntimeEntity): Promise<RuntimeEntity>;
  update(entity: RuntimeEntity): Promise<RuntimeEntity>;
  delete(id: string, ownerId: string): Promise<void>;
  findById(id: string, ownerId: string): Promise<RuntimeEntity | null>;
  findMany(query: Readonly<Record<string, unknown>>): Promise<{ readonly items: readonly RuntimeEntity[]; readonly nextCursor?: string }>;
}

const metadata = { ownerId: OWNER_A, createdAt: CREATED_AT, updatedAt: UPDATED_AT } as const;
const ids = {
  profile: identifier(201), measurement: identifier(202), vital: identifier(203), body: identifier(204),
  sleep: identifier(205), nutrition: identifier(206), hydration: identifier(207), medication: identifier(208),
  medicationLog: identifier(209), symptom: identifier(210), appointment: identifier(211), laboratory: identifier(212),
  exercise: identifier(213), workoutPlan: identifier(214), workout: identifier(215), exerciseSet: identifier(216),
  route: identifier(217), equipment: identifier(218), running: identifier(219), split: identifier(220),
  personalRecord: identifier(221), recovery: identifier(222),
} as const;

const fixtures: ReadonlyArray<readonly [string, RuntimeEntity]> = [
  ["measurements", { ...metadata, id: ids.measurement, type: "weight", measurement: { value: "70.2500", unit: "kilogram" }, observedAt: "2040-01-02T08:00:00.000Z" }],
  ["vitalReadings", { ...metadata, id: ids.vital, reading: { type: "resting_heart_rate", value: { value: 60, unit: "beats_per_minute" } }, observedAt: "2040-01-02T08:00:00.000Z" }],
  ["bodyComposition", { ...metadata, id: ids.body, observedAt: "2040-01-02T08:00:00.000Z", weight: { value: "70.2500", unit: "kilogram" } }],
  ["sleepRecords", { ...metadata, id: ids.sleep, startedAt: "2040-01-02T22:00:00.000Z", endedAt: "2040-01-03T06:00:00.000Z", duration: { value: "480", unit: "minute" }, quality: "good" }],
  ["nutritionEntries", { ...metadata, id: ids.nutrition, title: "Synthetic breakfast", mealType: "breakfast", consumedAt: "2040-01-02T08:30:00.000Z", energy: { value: "400", unit: "kilocalorie" } }],
  ["hydrationEntries", { ...metadata, id: ids.hydration, volume: { value: "500.1250", unit: "milliliter" }, consumedAt: "2040-01-02T09:00:00.000Z" }],
  ["medications", { ...metadata, id: ids.medication, name: "Synthetic medication", status: "active" }],
  ["medicationLogs", { ...metadata, id: ids.medicationLog, medicationId: ids.medication, status: "taken", recordedAt: "2040-01-02T09:30:00.000Z" }],
  ["symptomEntries", { ...metadata, id: ids.symptom, observation: "Synthetic observation", severity: { value: 2, scale: "zero_to_ten" }, observedAt: "2040-01-02T10:00:00.000Z" }],
  ["appointments", { ...metadata, id: ids.appointment, title: "Synthetic appointment", status: "scheduled", startsAt: "2040-01-10T10:00:00.000Z" }],
  ["laboratoryResults", { ...metadata, id: ids.laboratory, testName: "Synthetic test", result: { kind: "numeric", value: "1.2500", unit: "synthetic-unit" }, collectedAt: "2040-01-02T10:30:00.000Z" }],
  ["exercises", { ...metadata, id: ids.exercise, name: "Synthetic squat", category: "strength", status: "active" }],
  ["workoutPlans", { ...metadata, id: ids.workoutPlan, title: "Synthetic plan", status: "draft", startsOn: "2040-01-01" }],
  ["workoutSessions", { ...metadata, id: ids.workout, workoutPlanId: ids.workoutPlan, title: "Synthetic workout", status: "planned", scheduledAt: "2040-01-03T07:00:00.000Z" }],
  ["exerciseSets", { ...metadata, id: ids.exerciseSet, workoutSessionId: ids.workout, exerciseId: ids.exercise, sequence: 1, repetitions: { value: 8, unit: "repetition" }, weight: { value: "40.0000", unit: "kilogram" } }],
  ["activityRoutes", { ...metadata, id: ids.route, title: "Synthetic route", distance: { value: "5.0000", unit: "kilometer" } }],
  ["equipment", { ...metadata, id: ids.equipment, name: "Synthetic shoes", category: "running_shoes", status: "active" }],
  ["runningActivities", { ...metadata, id: ids.running, workoutSessionId: ids.workout, routeId: ids.route, equipmentIds: [ids.equipment], title: "Synthetic run", status: "planned", startedAt: "2040-01-03T07:00:00.000Z", distance: { value: "5.0000", unit: "kilometer" }, duration: { value: "30.0000", unit: "minute" } }],
  ["runningSplits", { ...metadata, id: ids.split, runningActivityId: ids.running, sequence: 1, distance: { value: "1.0000", unit: "kilometer" }, duration: { value: "6.0000", unit: "minute" } }],
  ["personalRecords", { ...metadata, id: ids.personalRecord, exerciseId: ids.exercise, runningActivityId: ids.running, title: "Synthetic distance record", metric: { type: "distance", value: { value: "5.0000", unit: "kilometer" } }, achievedAt: "2040-01-03T08:00:00.000Z" }],
  ["recoveryEntries", { ...metadata, id: ids.recovery, observedAt: "2040-01-03T08:00:00.000Z", energy: { value: 7, scale: "one_to_ten" }, fatigue: { value: 3, scale: "one_to_ten" } }],
];

const databases: Array<Awaited<ReturnType<typeof createTestDatabase>>["database"]> = [];
afterEach(async () => Promise.all(databases.splice(0).map((database) => database.close())));

describe("Health PostgreSQL repository contract", () => {
  it("persists every aggregate contract, profile lookup, and equipment usage", async () => {
    const testDatabase = await createTestDatabase();
    databases.push(testDatabase.database);
    const health = createHealthPostgresRepository(testDatabase.executor);
    const profile = { ...metadata, id: ids.profile, measurementSystem: "metric", status: "active" } as const;
    expect(await health.profiles.create(profile)).toEqual(profile);
    expect(await health.profiles.findByOwner(OWNER_A)).toEqual(profile);
    expect(await health.profiles.findByOwner(OWNER_B)).toBeNull();

    const runtime = health as unknown as Readonly<Record<string, RuntimeRepository>>;
    for (const [key, entity] of fixtures) {
      const repository = runtime[key]!;
      expect(await repository.create(structuredClone(entity))).toEqual(entity);
      expect(await repository.findById(entity.id, OWNER_A)).toEqual(entity);
      expect(await repository.findById(entity.id, OWNER_B)).toBeNull();
      expect((await repository.findMany({ ownerId: OWNER_A })).items).toContainEqual(entity);
      const updated = { ...entity, updatedAt: "2040-01-01T10:00:00.000Z" };
      expect(await repository.update(updated)).toEqual(updated);
    }

    const usage = await health.equipment.recordUsage({
      ownerId: OWNER_A,
      equipmentId: ids.equipment,
      distance: { value: "5.0000", unit: "kilometer" },
      duration: { value: "30.0000", unit: "minute" },
    });
    expect(usage.useCount).toBe(1);
    expect((await createHealthPostgresRepository(testDatabase.executor).equipment.getUsageSummary(ids.equipment, OWNER_A)).useCount).toBe(1);
    await runtime.recoveryEntries!.delete(ids.recovery, OWNER_A);
    expect(await runtime.recoveryEntries!.findById(ids.recovery, OWNER_A)).toBeNull();
  });

  it("keeps date filters, decimal strings, and snapshot-bound pagination consistent", async () => {
    const testDatabase = await createTestDatabase();
    databases.push(testDatabase.database);
    const health = createHealthPostgresRepository(testDatabase.executor);
    const hydration = fixtures.find(([key]) => key === "hydrationEntries")![1];
    const measurement = fixtures.find(([key]) => key === "measurements")![1];
    await (health.hydrationEntries as unknown as RuntimeRepository).create(hydration);
    await (health.hydrationEntries as unknown as RuntimeRepository).create({ ...hydration, id: identifier(230), consumedAt: "2040-01-03T09:00:00.000Z" });
    await (health.measurements as unknown as RuntimeRepository).create(measurement);
    await (health.measurements as unknown as RuntimeRepository).create({ ...measurement, id: identifier(232), observedAt: "2040-02-02T08:00:00.000Z" });
    expect((await (health.measurements as unknown as RuntimeRepository).findMany({ ownerId: OWNER_A, range: { startsAt: "2040-01-01T00:00:00.000Z", endsAt: "2040-01-31T23:59:59.999Z" } })).items).toHaveLength(1);
    expect((await health.hydrationEntries.findById(ids.hydration, OWNER_A))?.volume.value).toBe("500.1250");

    const first = await health.hydrationEntries.findMany({ ownerId: OWNER_A, limit: 1 });
    expect(first.nextCursor).toBeTypeOf("string");
    await (health.hydrationEntries as unknown as RuntimeRepository).create({ ...hydration, id: identifier(231), consumedAt: "2040-01-04T09:00:00.000Z" });
    await expect(health.hydrationEntries.findMany({ ownerId: OWNER_A, limit: 1, cursor: first.nextCursor })).rejects.toMatchObject({ code: "postgres-invalid-query" });
  });
});
