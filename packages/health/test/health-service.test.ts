import { describe, expect, it } from "vitest";

import {
  HealthApplicationError,
  createHealthService,
} from "../src/index.js";
import type { HealthRepository, HealthServiceDependencies } from "../src/index.js";
import { modelCases } from "./model-fixtures.js";

const OWNER = "synthetic-id-1";
const OTHER_OWNER = "synthetic-id-2";
const NOW = "2040-03-01T00:00:00Z";

type RecordValue = Readonly<Record<string, unknown>>;
type FakeRepository = ReturnType<typeof createFakeRepository>;

function fixture(name: string): RecordValue {
  const value = modelCases.find((candidate) => candidate.name === name)?.full;
  if (value === undefined) throw new Error(`Missing fixture ${name}`);
  return structuredClone(value);
}

function withoutOwner(name: string): RecordValue {
  const { ownerId: _ownerId, ...input } = fixture(name);
  return input;
}

function withoutStatus(name: string): RecordValue {
  const { status: _status, ...input } = withoutOwner(name);
  return input;
}

function createFakeRepository(entityName: string) {
  const rows: RecordValue[] = [fixture(entityName)];
  let failWith: Error | undefined;

  const maybeFail = (): void => {
    if (failWith !== undefined) throw failWith;
  };
  const timestamp = (row: RecordValue): string | undefined => {
    for (const key of ["observedAt", "consumedAt", "recordedAt", "collectedAt", "achievedAt", "startedAt", "scheduledAt", "startsAt", "createdAt"]) {
      const value = row[key];
      if (typeof value === "string") return value;
    }
    return undefined;
  };

  return {
    rows,
    setFailure(error?: Error): void { failWith = error; },
    async findById(id: string, ownerId: string) {
      maybeFail();
      return structuredClone(rows.find((row) => row.id === id && row.ownerId === ownerId) ?? null);
    },
    async findMany(query: RecordValue) {
      maybeFail();
      let items = rows.filter((row) => row.ownerId === query.ownerId);
      for (const key of ["status", "type", "category", "exerciseId", "workoutSessionId", "runningActivityId", "medicationId"]) {
        if (query[key] !== undefined) items = items.filter((row) => row[key] === query[key]);
      }
      if (typeof query.date === "string") items = items.filter((row) => timestamp(row)?.startsWith(query.date as string));
      const range = query.range as { readonly startsAt: string; readonly endsAt: string } | undefined;
      if (range !== undefined) items = items.filter((row) => {
        const value = timestamp(row);
        return value !== undefined && value >= range.startsAt && value <= range.endsAt;
      });
      if (typeof query.startsBefore === "string") {
        const startsBefore = query.startsBefore;
        items = items.filter((row) => typeof row.startsAt === "string" && row.startsAt <= startsBefore);
      }
      const limit = typeof query.limit === "number" ? query.limit : 100;
      return { items: structuredClone(items.slice(0, limit)) };
    },
    async create(input: RecordValue) {
      maybeFail();
      rows.push(structuredClone(input));
      return structuredClone(input);
    },
    async update(entity: RecordValue) {
      maybeFail();
      const index = rows.findIndex((row) => row.id === entity.id && row.ownerId === entity.ownerId);
      if (index < 0) throw new Error("Repository update target missing");
      rows[index] = structuredClone(entity);
      return structuredClone(entity);
    },
    async delete(id: string, ownerId: string) {
      maybeFail();
      const index = rows.findIndex((row) => row.id === id && row.ownerId === ownerId);
      if (index >= 0) rows.splice(index, 1);
    },
  };
}

const repositoryEntities = {
  appointments: "Appointment",
  bodyComposition: "BodyCompositionRecord",
  equipment: "Equipment",
  exerciseSets: "ExerciseSet",
  exercises: "Exercise",
  hydrationEntries: "HydrationEntry",
  laboratoryResults: "LaboratoryResult",
  measurements: "HealthMeasurement",
  medicationLogs: "MedicationLog",
  medications: "Medication",
  nutritionEntries: "NutritionEntry",
  personalRecords: "PersonalRecord",
  recoveryEntries: "RecoveryEntry",
  activityRoutes: "ActivityRoute",
  runningActivities: "RunningActivity",
  runningSplits: "RunningSplit",
  sleepRecords: "SleepRecord",
  symptomEntries: "SymptomEntry",
  vitalReadings: "VitalReading",
  workoutPlans: "WorkoutPlan",
  workoutSessions: "WorkoutSession",
} as const;

function createTestDependencies(options: { readonly duplicateIds?: boolean } = {}) {
  const fakes = Object.fromEntries(Object.entries(repositoryEntities).map(([key, name]) =>
    [key, createFakeRepository(name)])) as Record<keyof typeof repositoryEntities, FakeRepository>;
  const profiles = createFakeRepository("HealthProfile") as FakeRepository & {
    findByOwner(ownerId: string): Promise<RecordValue | null>;
  };
  profiles.findByOwner = async (ownerId: string) =>
    structuredClone(profiles.rows.find((row) => row.ownerId === ownerId) ?? null);

  let sequence = 0;
  const nextId = (): string => {
    sequence += 1;
    return options.duplicateIds === true ? "synthetic-id-1" : `generated-${sequence}`;
  };
  const equipment = Object.assign(fakes.equipment, {
    async recordUsage(input: RecordValue) {
      return { equipmentId: input.equipmentId, useCount: 1, ...(input.distance === undefined ? {} : { totalDistance: input.distance }), ...(input.duration === undefined ? {} : { totalDuration: input.duration }) };
    },
    async getUsageSummary(id: string) { return { equipmentId: id, useCount: 1 }; },
  });
  const repositories = { ...fakes, profiles, equipment } as unknown as HealthRepository;
  const dependencies: HealthServiceDependencies = {
    repositories,
    clock: { now: () => NOW },
    idGenerator: { generate: nextId },
  };
  return { dependencies, fakes, profiles };
}

const expectedMethods = [
  "createHealthProfile", "updateHealthProfile", "getHealthProfile",
  "recordHealthMeasurement", "updateHealthMeasurement", "deleteHealthMeasurement", "getHealthMeasurement", "listHealthMeasurements", "listHealthMeasurementsByType", "listHealthMeasurementsByDateRange",
  "recordVitalReading", "updateVitalReading", "deleteVitalReading", "getVitalReading", "listVitalReadings", "listVitalReadingsByType", "listVitalReadingsByDateRange",
  "recordBodyComposition", "updateBodyComposition", "deleteBodyComposition", "getBodyComposition", "listBodyCompositionRecords",
  "recordSleep", "updateSleep", "deleteSleep", "getSleepRecord", "listSleepRecords", "listSleepRecordsByDateRange",
  "createNutritionEntry", "updateNutritionEntry", "deleteNutritionEntry", "getNutritionEntry", "listNutritionEntries", "listNutritionEntriesByDate",
  "recordHydration", "updateHydrationEntry", "deleteHydrationEntry", "getHydrationEntry", "listHydrationEntries", "listHydrationEntriesByDate",
  "createMedication", "updateMedication", "archiveMedication", "getMedication", "listMedications", "recordMedicationTaken", "recordMedicationSkipped", "updateMedicationLog", "listMedicationLogs",
  "recordSymptom", "updateSymptomEntry", "deleteSymptomEntry", "getSymptomEntry", "listSymptomEntries",
  "createAppointment", "updateAppointment", "cancelAppointment", "completeAppointment", "getAppointment", "listAppointments", "listUpcomingAppointments",
  "recordLaboratoryResult", "updateLaboratoryResult", "deleteLaboratoryResult", "getLaboratoryResult", "listLaboratoryResults",
  "createExercise", "updateExercise", "archiveExercise", "getExercise", "listExercises", "listExercisesByCategory",
  "createWorkoutPlan", "updateWorkoutPlan", "archiveWorkoutPlan", "activateWorkoutPlan", "getWorkoutPlan", "listWorkoutPlans",
  "createWorkoutSession", "updateWorkoutSession", "startWorkout", "pauseWorkout", "resumeWorkout", "completeWorkout", "cancelWorkout", "getWorkoutSession", "listWorkoutSessions", "listWorkoutSessionsByDateRange",
  "recordExerciseSet", "updateExerciseSet", "deleteExerciseSet", "getExerciseSet", "listExerciseSetsByWorkout", "listExerciseSetsByExercise",
  "createRunningActivity", "updateRunningActivity", "completeRunningActivity", "deleteRunningActivity", "getRunningActivity", "listRunningActivities", "listRunningActivitiesByDateRange",
  "recordRunningSplit", "updateRunningSplit", "deleteRunningSplit", "listRunningSplitsByActivity",
  "createActivityRoute", "updateActivityRoute", "deleteActivityRoute", "getActivityRoute", "listActivityRoutes",
  "createEquipment", "updateEquipment", "retireEquipment", "getEquipment", "listEquipment", "recordEquipmentUsage", "getEquipmentUsageSummary",
  "recordPersonalRecord", "updatePersonalRecord", "deletePersonalRecord", "getPersonalRecord", "listPersonalRecords",
  "recordRecoveryEntry", "updateRecoveryEntry", "deleteRecoveryEntry", "getRecoveryEntry", "listRecoveryEntries",
  "getHealthOverview", "getLatestMeasurements", "getDailyHealthSummary", "getSleepSummary", "getHydrationSummary", "getWorkoutSummary", "getRunningSummary", "getRecoverySummary", "getUpcomingMedicationReminders", "getUpcomingAppointments",
] as const;

type DynamicService = Record<string, (...arguments_: unknown[]) => Promise<unknown>>;

describe("Health service public inventory", () => {
  it("implements the exact 137-method lifecycle and summary inventory", () => {
    const { dependencies } = createTestDependencies();
    const service = createHealthService(dependencies);
    expect(Object.keys(service).sort()).toEqual([...expectedMethods].sort());
    for (const method of expectedMethods) expect(service[method]).toBeTypeOf("function");
  });
});

const crudCases = [
  ["recordHealthMeasurement", "RecordHealthMeasurementInput", "updateHealthMeasurement", "UpdateHealthMeasurementInput", "getHealthMeasurement", "listHealthMeasurements", "deleteHealthMeasurement", false],
  ["recordVitalReading", "RecordVitalReadingInput", "updateVitalReading", "UpdateVitalReadingInput", "getVitalReading", "listVitalReadings", "deleteVitalReading", false],
  ["recordBodyComposition", "RecordBodyCompositionInput", "updateBodyComposition", "UpdateBodyCompositionInput", "getBodyComposition", "listBodyCompositionRecords", "deleteBodyComposition", false],
  ["recordSleep", "RecordSleepInput", "updateSleep", "UpdateSleepInput", "getSleepRecord", "listSleepRecords", "deleteSleep", false],
  ["createNutritionEntry", "CreateNutritionEntryInput", "updateNutritionEntry", "UpdateNutritionEntryInput", "getNutritionEntry", "listNutritionEntries", "deleteNutritionEntry", false],
  ["recordHydration", "RecordHydrationInput", "updateHydrationEntry", "UpdateHydrationEntryInput", "getHydrationEntry", "listHydrationEntries", "deleteHydrationEntry", false],
  ["createMedication", "CreateMedicationInput", "updateMedication", "UpdateMedicationInput", "getMedication", "listMedications", "deleteMedication", true],
  ["recordSymptom", "RecordSymptomInput", "updateSymptomEntry", "UpdateSymptomEntryInput", "getSymptomEntry", "listSymptomEntries", "deleteSymptomEntry", false],
  ["createAppointment", "CreateAppointmentInput", "updateAppointment", "UpdateAppointmentInput", "getAppointment", "listAppointments", "deleteAppointment", true],
  ["recordLaboratoryResult", "RecordLaboratoryResultInput", "updateLaboratoryResult", "UpdateLaboratoryResultInput", "getLaboratoryResult", "listLaboratoryResults", "deleteLaboratoryResult", false],
  ["createExercise", "CreateExerciseInput", "updateExercise", "UpdateExerciseInput", "getExercise", "listExercises", "deleteExercise", true],
  ["createWorkoutPlan", "CreateWorkoutPlanInput", "updateWorkoutPlan", "UpdateWorkoutPlanInput", "getWorkoutPlan", "listWorkoutPlans", "deleteWorkoutPlan", true],
  ["createWorkoutSession", "CreateWorkoutSessionInput", "updateWorkoutSession", "UpdateWorkoutSessionInput", "getWorkoutSession", "listWorkoutSessions", "deleteWorkoutSession", false],
  ["recordExerciseSet", "RecordExerciseSetInput", "updateExerciseSet", "UpdateExerciseSetInput", "getExerciseSet", "listExerciseSetsByWorkout", "deleteExerciseSet", false],
  ["createRunningActivity", "CreateRunningActivityInput", "updateRunningActivity", "UpdateRunningActivityInput", "getRunningActivity", "listRunningActivities", "deleteRunningActivity", false],
  ["createActivityRoute", "CreateActivityRouteInput", "updateActivityRoute", "UpdateActivityRouteInput", "getActivityRoute", "listActivityRoutes", "deleteActivityRoute", false],
  ["createEquipment", "CreateEquipmentInput", "updateEquipment", "UpdateEquipmentInput", "getEquipment", "listEquipment", "deleteEquipment", true],
  ["recordPersonalRecord", "RecordPersonalRecordInput", "updatePersonalRecord", "UpdatePersonalRecordInput", "getPersonalRecord", "listPersonalRecords", "deletePersonalRecord", false],
  ["recordRecoveryEntry", "RecordRecoveryEntryInput", "updateRecoveryEntry", "UpdateRecoveryEntryInput", "getRecoveryEntry", "listRecoveryEntries", "deleteRecoveryEntry", false],
] as const;

describe("Health entity workflows", () => {
  for (const [createMethod, createFixture, updateMethod, updateFixture, getMethod, listMethod, deleteMethod, stripsStatus] of crudCases) {
    it(`runs ${createMethod}, ${updateMethod}, ${getMethod}, ${listMethod}, and the supported delete path`, async () => {
      const { dependencies } = createTestDependencies();
      const service = createHealthService(dependencies) as unknown as DynamicService;
      const created = await service[createMethod]!({ ownerId: OWNER }, withoutOwner(createFixture)) as RecordValue;
      expect(created.id).toBe("generated-1");
      expect(created.createdAt).toBe(NOW);
      const updateInput = stripsStatus ? withoutStatus(updateFixture) : withoutOwner(updateFixture);
      const updated = await service[updateMethod]!({ ownerId: OWNER }, created.id, updateInput) as RecordValue;
      expect(updated.id).toBe(created.id);
      expect(updated.updatedAt).toBe(NOW);
      expect(await service[getMethod]!({ ownerId: OWNER }, created.id)).toMatchObject({ id: created.id, ownerId: OWNER });
      const listArguments = listMethod === "listExerciseSetsByWorkout"
        ? [{ ownerId: OWNER }, { workoutSessionId: "synthetic-id-1" }]
        : [{ ownerId: OWNER }];
      expect((await service[listMethod]!(...listArguments) as { items: unknown[] }).items.length).toBeGreaterThan(0);
      if (deleteMethod in service) {
        await service[deleteMethod]!({ ownerId: OWNER }, created.id);
        expect(await service[getMethod]!({ ownerId: OWNER }, created.id)).toBeNull();
      }
    });
  }

  it("creates, reads, and updates the one-profile-per-owner record", async () => {
    const { dependencies, profiles } = createTestDependencies();
    profiles.rows.splice(0);
    const service = createHealthService(dependencies);
    const created = await service.createHealthProfile({ ownerId: OWNER }, withoutOwner("CreateHealthProfileInput") as never);
    expect(await service.getHealthProfile({ ownerId: OWNER })).toMatchObject({ id: created.id, status: "active" });
    expect(await service.updateHealthProfile({ ownerId: OWNER }, created.id, { measurementSystem: "imperial" })).toMatchObject({ measurementSystem: "imperial" });
  });

  it("records both medication-log states and updates/lists them", async () => {
    const { dependencies } = createTestDependencies();
    const service = createHealthService(dependencies);
    const input = withoutOwner("RecordMedicationLogInput");
    const taken = await service.recordMedicationTaken({ ownerId: OWNER }, input as never);
    const skipped = await service.recordMedicationSkipped({ ownerId: OWNER }, input as never);
    expect([taken.status, skipped.status]).toEqual(["taken", "skipped"]);
    await service.updateMedicationLog({ ownerId: OWNER }, taken.id, withoutOwner("UpdateMedicationLogInput"));
    expect((await service.listMedicationLogs({ ownerId: OWNER })).items.length).toBe(3);
  });

  it("records, updates, lists, and deletes running splits", async () => {
    const { dependencies } = createTestDependencies();
    const service = createHealthService(dependencies);
    const created = await service.recordRunningSplit({ ownerId: OWNER }, withoutOwner("RecordRunningSplitInput") as never);
    expect(await service.updateRunningSplit({ ownerId: OWNER }, created.id, withoutOwner("UpdateRunningSplitInput"))).toMatchObject({ id: created.id });
    expect((await service.listRunningSplitsByActivity({ ownerId: OWNER }, { runningActivityId: "synthetic-id-1" })).items.length).toBeGreaterThan(0);
    await service.deleteRunningSplit({ ownerId: OWNER }, created.id);
  });

  it("records and reads validated equipment usage", async () => {
    const { dependencies } = createTestDependencies();
    const service = createHealthService(dependencies);
    expect(await service.recordEquipmentUsage({ ownerId: OWNER }, withoutOwner("RecordEquipmentUsageInput") as never)).toMatchObject({ useCount: 1 });
    expect(await service.getEquipmentUsageSummary({ ownerId: OWNER }, "synthetic-id-1")).toEqual({ equipmentId: "synthetic-id-1", useCount: 1 });
    expect(await service.getEquipmentUsageSummary(OWNER, "synthetic-id-1")).toEqual({ equipmentId: "synthetic-id-1", useCount: 1 });
  });
});

describe("Health lifecycle transitions", () => {
  it("executes appointment, catalog, medication, and plan transitions", async () => {
    const context = { ownerId: OWNER };
    const fresh = () => createHealthService(createTestDependencies().dependencies);
    expect((await fresh().cancelAppointment(context, "synthetic-id-1")).status).toBe("cancelled");
    expect((await fresh().completeAppointment(context, "synthetic-id-1")).status).toBe("completed");
    expect((await fresh().archiveExercise(context, "synthetic-id-1")).status).toBe("archived");
    expect((await fresh().archiveMedication(context, "synthetic-id-1")).status).toBe("archived");
    expect((await fresh().retireEquipment(context, "synthetic-id-1")).status).toBe("retired");
    expect((await fresh().activateWorkoutPlan(context, "synthetic-id-1")).status).toBe("active");
    expect((await fresh().archiveWorkoutPlan(context, "synthetic-id-1")).status).toBe("archived");
  });

  it("executes the complete workout and running lifecycles", async () => {
    const context = { ownerId: OWNER };
    const service = createHealthService(createTestDependencies().dependencies);
    const workout = await service.createWorkoutSession(context, { title: "Interval session" });
    expect((await service.startWorkout(context, workout.id, "2040-03-01T01:00:00Z")).status).toBe("in_progress");
    expect((await service.pauseWorkout(context, workout.id, "2040-03-01T01:30:00Z")).status).toBe("paused");
    expect((await service.resumeWorkout(context, workout.id, "2040-03-01T01:40:00Z")).status).toBe("in_progress");
    expect((await service.completeWorkout(context, workout.id, "2040-03-01T02:00:00Z")).status).toBe("completed");
    const cancelled = await service.createWorkoutSession(context, { title: "Cancelled session" });
    expect((await service.cancelWorkout(context, cancelled.id)).status).toBe("cancelled");
    const run = await service.createRunningActivity(context, { title: "Morning run", startedAt: "2040-03-01T03:00:00Z" });
    expect((await service.completeRunningActivity(context, run.id, "2040-03-01T04:00:00Z")).status).toBe("completed");
  });

  it("rejects invalid transitions before repository mutation", async () => {
    const { dependencies, fakes } = createTestDependencies();
    const service = createHealthService(dependencies);
    await service.cancelAppointment({ ownerId: OWNER }, "synthetic-id-1");
    const count = fakes.appointments.rows.length;
    await expect(service.completeAppointment({ ownerId: OWNER }, "synthetic-id-1")).rejects.toMatchObject({ code: "health-invalid-state-transition" });
    expect(fakes.appointments.rows).toHaveLength(count);
    await expect(service.updateMedication({ ownerId: OWNER }, "synthetic-id-1", { status: "archived" })).rejects.toMatchObject({ code: "health-invalid-state-transition" });
  });
});

describe("Specialized queries and calculation orchestration", () => {
  it("executes every specialized list method", async () => {
    const service = createHealthService(createTestDependencies().dependencies);
    const context = { ownerId: OWNER };
    const range = { startsAt: "2040-02-01T00:00:00Z", endsAt: "2040-03-02T00:00:00Z" };
    const calls = [
      service.listHealthMeasurementsByType(context, { type: "weight" }),
      service.listHealthMeasurementsByDateRange(context, { range }),
      service.listVitalReadingsByType(context, { type: "resting_heart_rate" }),
      service.listVitalReadingsByDateRange(context, { range }),
      service.listSleepRecordsByDateRange(context, { range }),
      service.listNutritionEntriesByDate(context, { date: "2040-02-29" }),
      service.listHydrationEntriesByDate(context, { date: "2040-02-29" }),
      service.listUpcomingAppointments(context),
      service.listExercisesByCategory(context, { category: "strength" }),
      service.listWorkoutSessionsByDateRange(context, { range }),
      service.listExerciseSetsByWorkout(context, { workoutSessionId: "synthetic-id-1" }),
      service.listExerciseSetsByExercise(context, { exerciseId: "synthetic-id-1" }),
      service.listRunningActivitiesByDateRange(context, { range }),
      service.listRunningSplitsByActivity(context, { runningActivityId: "synthetic-id-1" }),
    ];
    const pages = await Promise.all(calls);
    expect(pages).toHaveLength(14);
    expect(pages.every((page) => Array.isArray(page.items))).toBe(true);
  });

  it("returns all 11 validated summary results and uses Phase 12 calculations", async () => {
    const { dependencies } = createTestDependencies();
    const service = createHealthService(dependencies);
    const range = { startsAt: "2040-02-01T00:00:00Z", endsAt: "2040-03-02T00:00:00Z" };
    expect(await service.getHealthOverview(OWNER)).toMatchObject({ latestMeasurementCount: 1 });
    expect(await service.getLatestMeasurements(OWNER)).toHaveLength(1);
    expect(await service.getDailyHealthSummary(OWNER, "2040-02-29")).toMatchObject({ date: "2040-02-29" });
    expect((await service.getSleepSummary({ ownerId: OWNER, range })).isEstimate).toBe(false);
    expect((await service.getHydrationSummary({ ownerId: OWNER, range })).totalVolume.unit).toBe("liter");
    expect(await service.getWorkoutSummary({ ownerId: OWNER, range })).toMatchObject({ workoutCount: 1 });
    expect((await service.getRunningSummary({ ownerId: OWNER, range })).totalDistance.unit).toBe("kilometer");
    expect((await service.getRecoverySummary({ ownerId: OWNER, range })).ratingScale).toBe("one_to_ten");
    expect(await service.getEquipmentUsageSummary(OWNER, "synthetic-id-1")).toMatchObject({ equipmentId: "synthetic-id-1" });
    expect(await service.getUpcomingMedicationReminders({ ownerId: OWNER })).toEqual([]);
    expect(await service.getUpcomingAppointments({ ownerId: OWNER })).toEqual([]);
  });

  it("uses absolute instants and nanosecond precision in summaries", async () => {
    const { dependencies, fakes } = createTestDependencies();
    const measurement = structuredClone(fakes.measurements.rows[0]!);
    fakes.measurements.rows.splice(0,
      Infinity,
      { ...measurement, id: "offset-earlier", observedAt: "2040-01-01T01:00:00.123456788+01:00" },
      { ...measurement, id: "fraction-later", observedAt: "2040-01-01T00:00:00.123456789Z" },
    );

    const hydration = structuredClone(fakes.hydrationEntries.rows[0]!);
    fakes.hydrationEntries.rows.splice(0,
      Infinity,
      { ...hydration, id: "in-range", consumedAt: "2040-01-01T05:30:00.000000001+05:30" },
      { ...hydration, id: "out-of-range", consumedAt: "2039-12-31T20:00:00-05:00" },
    );

    const recovery = structuredClone(fakes.recoveryEntries.rows[0]!);
    fakes.recoveryEntries.rows.splice(0,
      Infinity,
      { ...recovery, id: "in-range", observedAt: "2040-01-01T05:30:00.000000001+05:30" },
      { ...recovery, id: "out-of-range", observedAt: "2039-12-31T20:00:00-05:00" },
    );

    const appointment = structuredClone(fakes.appointments.rows[0]!);
    fakes.appointments.rows.splice(0,
      Infinity,
      { ...appointment, id: "already-past", status: "scheduled", startsAt: "2040-03-01T05:00:00+05:30", endsAt: "2040-03-01T06:00:00+05:30" },
      { ...appointment, id: "still-upcoming", status: "scheduled", startsAt: "2040-02-29T20:00:00-05:00", endsAt: "2040-02-29T21:00:00-05:00" },
    );

    const workout = structuredClone(fakes.workoutSessions.rows[0]!);
    fakes.workoutSessions.rows.splice(0, Infinity, {
      ...workout,
      status: "completed",
      scheduledAt: "2040-01-01T00:00:00Z",
      startedAt: "2040-03-01T00:00:00.000000001Z",
      endedAt: "2040-03-01T01:00:00.000000002+01:00",
    });

    const service = createHealthService(dependencies);
    const instantRange = {
      startsAt: "2040-01-01T00:00:00.000000001Z",
      endsAt: "2040-01-01T00:00:00.000000001Z",
    };
    expect((await service.getLatestMeasurements(OWNER))[0]?.id).toBe("fraction-later");
    expect((await service.getHydrationSummary({ ownerId: OWNER, range: instantRange })).entryCount).toBe(1);
    expect((await service.getRecoverySummary({ ownerId: OWNER, range: instantRange })).entryCount).toBe(1);
    expect(await service.getHealthOverview(OWNER)).toMatchObject({ upcomingAppointmentCount: 1 });
    expect((await service.getUpcomingAppointments({ ownerId: OWNER })).map((item) => item.id)).toEqual(["still-upcoming"]);
    expect((await service.getWorkoutSummary({
      ownerId: OWNER,
      range: { startsAt: "2040-01-01T00:00:00Z", endsAt: "2040-04-01T00:00:00Z" },
    })).totalDuration).toEqual({ value: "0.000000001", unit: "second" });
  });

  it("follows repository cursors when producing aggregate summaries", async () => {
    const { dependencies, fakes } = createTestDependencies();
    const first = structuredClone(fakes.measurements.rows[0]!);
    const second = { ...first, id: "synthetic-page-2", observedAt: "2040-03-01T12:00:00Z" };
    fakes.measurements.findMany = async (query: RecordValue) => query.cursor === "page-2"
      ? { items: [second] }
      : { items: [first], nextCursor: "page-2" };

    const latest = await createHealthService(dependencies).getLatestMeasurements(OWNER);
    expect(latest).toHaveLength(1);
    expect(latest[0]?.id).toBe("synthetic-page-2");
  });
});

describe("Health service boundaries", () => {
  it("rejects missing and cross-owner parents", async () => {
    const { dependencies, fakes } = createTestDependencies();
    const service = createHealthService(dependencies);
    await expect(service.recordExerciseSet({ ownerId: OWNER }, {
      ...withoutOwner("RecordExerciseSetInput"), workoutSessionId: "missing-parent",
    } as never)).rejects.toMatchObject({ code: "health-parent-not-found" });
    fakes.exercises.rows[0] = { ...fakes.exercises.rows[0]!, ownerId: OTHER_OWNER };
    await expect(service.recordExerciseSet({ ownerId: OWNER }, withoutOwner("RecordExerciseSetInput") as never)).rejects.toMatchObject({ code: "health-parent-not-found" });
  });

  it("rejects duplicate generated IDs and invalid input before writes", async () => {
    const duplicate = createTestDependencies({ duplicateIds: true });
    const duplicateService = createHealthService(duplicate.dependencies);
    const count = duplicate.fakes.hydrationEntries.rows.length;
    await expect(duplicateService.recordHydration({ ownerId: OWNER }, withoutOwner("RecordHydrationInput") as never)).rejects.toMatchObject({ code: "health-conflict" });
    expect(duplicate.fakes.hydrationEntries.rows).toHaveLength(count);

    const normal = createTestDependencies();
    const service = createHealthService(normal.dependencies);
    await expect(service.recordHydration({ ownerId: OWNER }, { volume: { value: "NaN", unit: "liter" }, consumedAt: NOW })).rejects.toMatchObject({ code: "health-validation-failed" });
    expect(normal.fakes.hydrationEntries.rows).toHaveLength(1);
  });

  it("propagates repository failures without a follow-up mutation", async () => {
    const { dependencies, fakes } = createTestDependencies();
    const failure = new Error("synthetic repository outage");
    fakes.hydrationEntries.setFailure(failure);
    const service = createHealthService(dependencies);
    await expect(service.listHydrationEntries({ ownerId: OWNER })).rejects.toBe(failure);
    expect(fakes.hydrationEntries.rows).toHaveLength(1);
  });

  it("rejects repository results that escape the owner boundary", async () => {
    const { dependencies, fakes } = createTestDependencies();
    const originalCreate = fakes.hydrationEntries.create;
    fakes.hydrationEntries.create = async (input: RecordValue) => ({ ...await originalCreate(input), ownerId: OTHER_OWNER });
    const service = createHealthService(dependencies);
    await expect(service.recordHydration({ ownerId: OWNER }, withoutOwner("RecordHydrationInput") as never)).rejects.toMatchObject({ code: "health-repository-contract-violation" });
  });

  it("does not allow payloads to assign an owner", async () => {
    const service = createHealthService(createTestDependencies().dependencies);
    await expect(service.recordHydration({ ownerId: OWNER }, { ...withoutOwner("RecordHydrationInput"), ownerId: OTHER_OWNER } as never)).rejects.toBeInstanceOf(HealthApplicationError);
  });
});
