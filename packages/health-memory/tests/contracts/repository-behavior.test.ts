import { describe, expect, it } from "vitest";

import type { HealthRepository, OwnerId, PageResult } from "@aperture/health";
import {
  HealthMemoryRepositoryError,
  createHealthMemoryRepository,
} from "../../src/index.js";
import {
  FIXTURE_IDS,
  OWNER_A,
  OWNER_B,
  buildAppointment,
  buildEquipment,
  buildExercise,
  buildExerciseSet,
  buildHealthMeasurement,
  buildHealthProfile,
  buildHydrationEntry,
  buildMedication,
  buildMedicationLog,
  buildNutritionEntry,
  buildPersonalRecord,
  buildRunningActivity,
  buildRunningSplit,
  buildSleepRecord,
  buildVitalReading,
  buildWorkoutPlan,
  buildWorkoutSession,
} from "../fixtures/health-fixtures.js";

interface RuntimeListRepository {
  findMany(query: Readonly<Record<string, unknown>> & { readonly ownerId: OwnerId }): Promise<PageResult<{ readonly id: string }>>;
}

function runtimeList(repository: object): RuntimeListRepository {
  return repository as RuntimeListRepository;
}

describe("Health memory aggregate", () => {
  it("exposes and freezes every Health repository interface", () => {
    const repository: HealthRepository = createHealthMemoryRepository();
    expect(Object.keys(repository).sort()).toEqual([
      "activityRoutes", "appointments", "bodyComposition", "equipment", "exerciseSets", "exercises",
      "hydrationEntries", "laboratoryResults", "measurements", "medicationLogs", "medications",
      "nutritionEntries", "personalRecords", "profiles", "recoveryEntries", "runningActivities",
      "runningSplits", "sleepRecords", "symptomEntries", "vitalReadings", "workoutPlans", "workoutSessions",
    ]);
    expect(Object.isFrozen(repository)).toBe(true);
    expect(Object.values(repository).every((value) => Object.isFrozen(value))).toBe(true);
  });

  it("starts empty without implicit personal or sample records", async () => {
    const repository = createHealthMemoryRepository();
    const pages = await Promise.all([
      repository.measurements.findMany({ ownerId: OWNER_A }),
      repository.appointments.findMany({ ownerId: OWNER_A }),
      repository.workoutSessions.findMany({ ownerId: OWNER_A }),
      repository.runningActivities.findMany({ ownerId: OWNER_A }),
      repository.nutritionEntries.findMany({ ownerId: OWNER_A }),
      repository.hydrationEntries.findMany({ ownerId: OWNER_A }),
    ]);
    expect(pages.every((page) => page.items.length === 0)).toBe(true);
    await expect(repository.profiles.findByOwner(OWNER_A)).resolves.toBeNull();
  });
});

describe("Health profile memory repository", () => {
  it("implements create, find-by-ID, find-by-owner, and update", async () => {
    const repository = createHealthMemoryRepository().profiles;
    const profile = buildHealthProfile();
    await repository.create(profile);
    await expect(repository.findById(profile.id, OWNER_A)).resolves.toEqual(profile);
    await expect(repository.findByOwner(OWNER_A)).resolves.toEqual(profile);
    await expect(repository.findById(profile.id, OWNER_B)).resolves.toBeNull();
    await expect(repository.findByOwner(OWNER_B)).resolves.toBeNull();
    const updated = { ...profile, measurementSystem: "imperial" as const, updatedAt: "2040-01-01T10:00:00Z" };
    await expect(repository.update(updated)).resolves.toEqual(updated);
  });

  it("enforces one profile per owner and globally unique profile IDs", async () => {
    const repository = createHealthMemoryRepository().profiles;
    await repository.create(buildHealthProfile());
    await expect(repository.create(buildHealthProfile({ id: "second-profile" }))).rejects.toMatchObject({
      code: "health-memory-owner-conflict",
    });
    await expect(repository.create(buildHealthProfile({ ownerId: OWNER_B }))).rejects.toMatchObject({
      code: "health-memory-duplicate-id",
    });
  });

  it("defensively copies nested and top-level values", async () => {
    const repository = createHealthMemoryRepository().profiles;
    const profile = buildHealthProfile();
    const created = await repository.create(profile);
    (created as { measurementSystem: string }).measurementSystem = "imperial";
    expect((await repository.findByOwner(OWNER_A))?.measurementSystem).toBe("metric");
  });
});

describe("Health memory query filters", () => {
  it("applies appointment, equipment, exercise, medication, and plan filters with AND semantics", async () => {
    const repository = createHealthMemoryRepository();
    await repository.appointments.create(buildAppointment());
    await repository.appointments.create(buildAppointment({ id: "appointment-2", status: "completed", startsAt: "2040-01-05T10:00:00Z" }));
    expect((await runtimeList(repository.appointments).findMany({ ownerId: OWNER_A, status: "scheduled", startsBefore: "2040-01-10T10:00:00Z" })).items.map((item) => item.id)).toEqual([FIXTURE_IDS.appointment]);

    await repository.equipment.create(buildEquipment());
    await repository.equipment.create(buildEquipment({ id: "equipment-2", name: "Synthetic bike", category: "cardio", status: "retired" }));
    expect((await repository.equipment.findMany({ ownerId: OWNER_A, category: "running_shoes", status: "active" })).items.map((item) => item.id)).toEqual([FIXTURE_IDS.equipment]);

    await repository.exercises.create(buildExercise());
    await repository.exercises.create(buildExercise({ id: "exercise-2", name: "Synthetic walk", category: "cardio", status: "archived" }));
    expect((await repository.exercises.findMany({ ownerId: OWNER_A, category: "strength", status: "active" })).items.map((item) => item.id)).toEqual([FIXTURE_IDS.exercise]);

    await repository.medications.create(buildMedication());
    await repository.medications.create(buildMedication({ id: "medication-2", name: "Archived synthetic medication", status: "archived" }));
    expect((await repository.medications.findMany({ ownerId: OWNER_A, status: "active" })).items.map((item) => item.id)).toEqual([FIXTURE_IDS.medication]);

    await repository.workoutPlans.create(buildWorkoutPlan());
    await repository.workoutPlans.create(buildWorkoutPlan({ id: "plan-2", title: "Archived plan", status: "archived" }));
    expect((await repository.workoutPlans.findMany({ ownerId: OWNER_A, status: "draft" })).items.map((item) => item.id)).toEqual([FIXTURE_IDS.workoutPlan]);
  });

  it("filters measurement and vital types at inclusive range boundaries", async () => {
    const repository = createHealthMemoryRepository();
    await repository.measurements.create(buildHealthMeasurement({ observedAt: "2040-01-02T00:00:00Z" }));
    await repository.measurements.create(buildHealthMeasurement({ id: "measurement-2", type: "height", measurement: { value: "175", unit: "centimeter" }, observedAt: "2040-01-02T23:59:59Z" }));
    const measurementPage = await runtimeList(repository.measurements).findMany({
      ownerId: OWNER_A,
      type: "height",
      range: { startsAt: "2040-01-02T00:00:00Z", endsAt: "2040-01-02T23:59:59Z" },
    });
    expect(measurementPage.items.map((item) => item.id)).toEqual(["measurement-2"]);

    await repository.vitalReadings.create(buildVitalReading({ observedAt: "2040-01-02T00:00:00Z" }));
    await repository.vitalReadings.create(buildVitalReading({ id: "vital-2", reading: { type: "blood_pressure", value: { systolic: 120, diastolic: 80, unit: "millimeters_of_mercury" } }, observedAt: "2040-01-02T23:59:59Z" }));
    const vitalPage = await runtimeList(repository.vitalReadings).findMany({
      ownerId: OWNER_A,
      type: "blood_pressure",
      range: { startsAt: "2040-01-02T00:00:00Z", endsAt: "2040-01-02T23:59:59Z" },
    });
    expect(vitalPage.items.map((item) => item.id)).toEqual(["vital-2"]);
  });

  it("applies every relationship filter", async () => {
    const repository = createHealthMemoryRepository();
    await repository.exerciseSets.create(buildExerciseSet());
    await repository.exerciseSets.create(buildExerciseSet({ id: "set-2", workoutSessionId: "other-workout", exerciseId: "other-exercise" }));
    expect((await repository.exerciseSets.findMany({ ownerId: OWNER_A, workoutSessionId: FIXTURE_IDS.workout, exerciseId: FIXTURE_IDS.exercise })).items).toHaveLength(1);

    await repository.medicationLogs.create(buildMedicationLog());
    await repository.medicationLogs.create(buildMedicationLog({ id: "log-2", medicationId: "other-medication" }));
    expect((await repository.medicationLogs.findMany({ ownerId: OWNER_A, medicationId: FIXTURE_IDS.medication })).items).toHaveLength(1);

    await repository.personalRecords.create(buildPersonalRecord());
    await repository.personalRecords.create(buildPersonalRecord({ id: "record-2", exerciseId: "other-exercise" }));
    expect((await repository.personalRecords.findMany({ ownerId: OWNER_A, exerciseId: FIXTURE_IDS.exercise })).items).toHaveLength(1);

    await repository.runningSplits.create(buildRunningSplit());
    await repository.runningSplits.create(buildRunningSplit({ id: "split-2", runningActivityId: "other-running" }));
    expect((await repository.runningSplits.findMany({ ownerId: OWNER_A, runningActivityId: FIXTURE_IDS.running })).items).toHaveLength(1);
  });

  it("filters hydration and nutrition by exact calendar date", async () => {
    const repository = createHealthMemoryRepository();
    await repository.hydrationEntries.create(buildHydrationEntry());
    await repository.hydrationEntries.create(buildHydrationEntry({ id: "hydration-2", consumedAt: "2040-01-03T00:00:00Z" }));
    expect((await runtimeList(repository.hydrationEntries).findMany({ ownerId: OWNER_A, date: "2040-01-02" })).items).toHaveLength(1);

    await repository.nutritionEntries.create(buildNutritionEntry());
    await repository.nutritionEntries.create(buildNutritionEntry({ id: "nutrition-2", consumedAt: "2040-01-03T00:00:00Z" }));
    expect((await runtimeList(repository.nutritionEntries).findMany({ ownerId: OWNER_A, date: "2040-01-02" })).items).toHaveLength(1);
  });

  it("applies inclusive ranges to sleep, running, and workout timestamps", async () => {
    const repository = createHealthMemoryRepository();
    const range = { startsAt: "2040-01-03T07:00:00Z", endsAt: "2040-01-03T07:00:00Z" };
    await repository.sleepRecords.create(buildSleepRecord({ startedAt: range.startsAt, endedAt: "2040-01-03T08:00:00Z" }));
    await repository.runningActivities.create(buildRunningActivity({ startedAt: range.startsAt }));
    await repository.workoutSessions.create(buildWorkoutSession({ scheduledAt: range.startsAt }));
    expect((await runtimeList(repository.sleepRecords).findMany({ ownerId: OWNER_A, range })).items).toHaveLength(1);
    expect((await runtimeList(repository.runningActivities).findMany({ ownerId: OWNER_A, range })).items).toHaveLength(1);
    expect((await runtimeList(repository.workoutSessions).findMany({ ownerId: OWNER_A, range })).items).toHaveLength(1);
  });

  it("orders domain timestamps and names deterministically", async () => {
    const repository = createHealthMemoryRepository();
    await repository.appointments.create(buildAppointment({ id: "later", startsAt: "2040-02-01T00:00:00Z" }));
    await repository.appointments.create(buildAppointment({ id: "earlier", startsAt: "2040-01-01T00:00:00Z" }));
    expect((await repository.appointments.findMany({ ownerId: OWNER_A })).items.map((item) => item.id)).toEqual(["earlier", "later"]);

    await repository.exercises.create(buildExercise({ id: "zulu", name: "Zulu" }));
    await repository.exercises.create(buildExercise({ id: "alpha", name: "Alpha" }));
    expect((await repository.exercises.findMany({ ownerId: OWNER_A })).items.map((item) => item.name)).toEqual(["Alpha", "Zulu"]);
  });
});

describe("Equipment usage memory repository", () => {
  it("records, converts, and sums owner-scoped usage", async () => {
    const repository = createHealthMemoryRepository().equipment;
    await repository.create(buildEquipment());
    await expect(repository.getUsageSummary(FIXTURE_IDS.equipment, OWNER_A)).resolves.toEqual({ equipmentId: FIXTURE_IDS.equipment, useCount: 0 });
    await repository.recordUsage({ ownerId: OWNER_A, equipmentId: FIXTURE_IDS.equipment, distance: { value: "1", unit: "mile" }, duration: { value: "1", unit: "minute" } });
    const second = await repository.recordUsage({ ownerId: OWNER_A, equipmentId: FIXTURE_IDS.equipment, distance: { value: "1", unit: "kilometer" }, duration: { value: "30", unit: "second" } });
    expect(second).toEqual({
      equipmentId: FIXTURE_IDS.equipment,
      useCount: 2,
      totalDistance: { value: "2.609344", unit: "kilometer" },
      totalDuration: { value: "90", unit: "second" },
    });
    await expect(repository.getUsageSummary(FIXTURE_IDS.equipment, OWNER_B)).rejects.toMatchObject({ code: "health-memory-record-not-found" });
  });

  it("defensively copies usage and removes it with its equipment", async () => {
    const repository = createHealthMemoryRepository().equipment;
    await repository.create(buildEquipment());
    const usage = { ownerId: OWNER_A, equipmentId: FIXTURE_IDS.equipment, distance: { value: "1", unit: "kilometer" as const } };
    await repository.recordUsage(usage);
    (usage.distance as { value: string }).value = "99";
    expect((await repository.getUsageSummary(FIXTURE_IDS.equipment, OWNER_A)).totalDistance?.value).toBe("1");
    await repository.delete(FIXTURE_IDS.equipment, OWNER_A);
    await repository.create(buildEquipment());
    await expect(repository.getUsageSummary(FIXTURE_IDS.equipment, OWNER_A)).resolves.toEqual({ equipmentId: FIXTURE_IDS.equipment, useCount: 0 });
  });

  it("returns structured errors without leaking data", async () => {
    const repository = createHealthMemoryRepository().equipment;
    try {
      await repository.recordUsage({ ownerId: OWNER_A, equipmentId: FIXTURE_IDS.equipment });
      throw new Error("Expected equipment error.");
    } catch (error) {
      expect(error).toBeInstanceOf(HealthMemoryRepositoryError);
      expect((error as HealthMemoryRepositoryError).entityId).toBe(FIXTURE_IDS.equipment);
    }
  });
});

describe("nested defensive copies", () => {
  it("protects nested running equipment identifiers", async () => {
    const repository = createHealthMemoryRepository().runningActivities;
    const running = buildRunningActivity();
    await repository.create(running);
    (running.equipmentIds as string[])[0] = "changed";
    const found = await repository.findById(running.id, OWNER_A);
    expect(found?.equipmentIds).toEqual([FIXTURE_IDS.equipment]);
    (found?.equipmentIds as string[])[0] = "changed-again";
    expect((await repository.findById(running.id, OWNER_A))?.equipmentIds).toEqual([FIXTURE_IDS.equipment]);
  });
});
