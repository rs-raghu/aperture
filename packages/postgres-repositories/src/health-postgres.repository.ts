import {
  activityRouteSchema,
  appointmentSchema,
  bodyCompositionRecordSchema,
  calculateRunningSummary,
  equipmentSchema,
  equipmentUsageSummarySchema,
  exerciseSchema,
  exerciseSetSchema,
  healthMeasurementSchema,
  healthProfileSchema,
  hydrationEntrySchema,
  laboratoryResultSchema,
  medicationLogSchema,
  medicationSchema,
  nutritionEntrySchema,
  personalRecordSchema,
  recoveryEntrySchema,
  runningActivitySchema,
  runningSplitSchema,
  sleepRecordSchema,
  symptomEntrySchema,
  vitalReadingSchema,
  workoutPlanSchema,
  workoutSessionSchema,
  type ActivityRoute,
  type Appointment,
  type BodyCompositionRecord,
  type Equipment,
  type EquipmentId,
  type EquipmentListQuery,
  type EquipmentRepository,
  type EquipmentUsageSummary,
  type Exercise,
  type ExerciseSet,
  type HealthMeasurement,
  type HealthProfile,
  type HealthRepository,
  type HydrationEntry,
  type LaboratoryResult,
  type Medication,
  type MedicationLog,
  type NutritionEntry,
  type OwnerId,
  type PersonalRecord,
  type RecordEquipmentUsageInput,
  type RecoveryEntry,
  type RunningActivity,
  type RunningSplit,
  type SleepRecord,
  type SymptomEntry,
  type VitalReading,
  type WorkoutPlan,
  type WorkoutSession,
} from "@aperture/health";
import {
  createActivityRouteMemoryRepository,
  createAppointmentMemoryRepository,
  createBodyCompositionMemoryRepository,
  createExerciseMemoryRepository,
  createExerciseSetMemoryRepository,
  createHealthMeasurementMemoryRepository,
  createHydrationEntryMemoryRepository,
  createLaboratoryResultMemoryRepository,
  createMedicationLogMemoryRepository,
  createMedicationMemoryRepository,
  createNutritionEntryMemoryRepository,
  createPersonalRecordMemoryRepository,
  createRecoveryEntryMemoryRepository,
  createRunningActivityMemoryRepository,
  createRunningSplitMemoryRepository,
  createSleepRecordMemoryRepository,
  createSymptomEntryMemoryRepository,
  createVitalReadingMemoryRepository,
  createWorkoutPlanMemoryRepository,
  createWorkoutSessionMemoryRepository,
  HealthEntityCollection,
  type HealthEntityComparator,
  type HealthEntityMatcher,
  type HealthMemoryEntity,
  type HealthMemoryQuery,
} from "@aperture/health-memory/adapter-internals";

import { PostgresRepositoryError, type SqlExecutor } from "./postgres.types.js";
import { generateUuid } from "./random-identifier.js";
import {
  compareText,
  PostgresCollection,
  type DurableEntity,
  type RuntimeSchema,
} from "./store/postgres-collection.js";

type RecordEntity = HealthMemoryEntity & Readonly<Record<string, unknown>>;

function field(entity: RecordEntity, name: string): unknown {
  return entity[name] ?? null;
}

function objectField(value: unknown, name: string): unknown {
  return typeof value === "object" && value !== null
    ? (value as Readonly<Record<string, unknown>>)[name] ?? null
    : null;
}

function nested(entity: RecordEntity, objectName: string, name: string): unknown {
  return objectField(entity[objectName], name);
}

function firstMeasurement(entity: RecordEntity): { readonly type: string; readonly value: unknown; readonly unit: unknown } {
  for (const key of ["weight", "height", "bodyFat", "waist", "hip", "muscleMass"] as const) {
    const candidate = entity[key];
    if (typeof candidate === "object" && candidate !== null) {
      return {
        type: key,
        value: objectField(candidate, "value"),
        unit: objectField(candidate, "unit") ?? (key === "bodyFat" ? "percent" : null),
      };
    }
  }
  return { type: "unspecified", value: 0, unit: "unspecified" };
}

const projections = {
  profiles: (entity: RecordEntity) => ({ birth_date: field(entity, "birthDate"), measurement_system: field(entity, "measurementSystem") }),
  measurements: (entity: RecordEntity) => ({ measurement_type: field(entity, "type"), measured_value: nested(entity, "measurement", "value"), unit: nested(entity, "measurement", "unit"), observed_at: field(entity, "observedAt") }),
  vital_readings: (entity: RecordEntity) => {
    const reading = entity.reading;
    const value = objectField(reading, "value");
    return {
      vital_type: objectField(reading, "type"),
      primary_value: objectField(value, "value") ?? objectField(value, "systolic"),
      secondary_value: objectField(value, "diastolic"),
      unit: objectField(value, "unit"),
      observed_at: field(entity, "observedAt"),
    };
  },
  body_composition: (entity: RecordEntity) => {
    const measurement = firstMeasurement(entity);
    return { metric_type: measurement.type, metric_value: measurement.value, unit: measurement.unit, observed_at: field(entity, "observedAt") };
  },
  sleep_records: (entity: RecordEntity) => ({ started_at: field(entity, "startedAt"), ended_at: field(entity, "endedAt"), duration_minutes: nested(entity, "duration", "value"), quality: field(entity, "quality") }),
  nutrition_entries: (entity: RecordEntity) => ({ title: field(entity, "title"), meal_type: field(entity, "mealType"), consumed_at: field(entity, "consumedAt"), energy_kilocalories: nested(entity, "energy", "value") }),
  hydration_entries: (entity: RecordEntity) => ({ volume_milliliters: nested(entity, "volume", "value"), consumed_at: field(entity, "consumedAt") }),
  medications: (entity: RecordEntity) => ({ name: field(entity, "name"), dosage_value: nested(entity, "dosage", "value"), dosage_unit: nested(entity, "dosage", "unit"), status: field(entity, "status") }),
  medication_logs: (entity: RecordEntity) => ({ medication_id: field(entity, "medicationId"), logged_at: field(entity, "recordedAt"), status: field(entity, "status") }),
  symptom_entries: (entity: RecordEntity) => ({ symptom: field(entity, "observation"), severity: nested(entity, "severity", "value"), observed_at: field(entity, "observedAt") }),
  appointments: (entity: RecordEntity) => ({ title: field(entity, "title"), starts_at: field(entity, "startsAt"), ends_at: field(entity, "endsAt"), status: field(entity, "status") }),
  laboratory_results: (entity: RecordEntity) => {
    const result = entity.result;
    const kind = objectField(result, "kind");
    return { test_name: field(entity, "testName"), result_value: kind === "numeric" ? objectField(result, "value") : null, result_text: kind === "text" ? objectField(result, "value") : null, unit: objectField(result, "unit"), observed_at: field(entity, "collectedAt") };
  },
  exercises: (entity: RecordEntity) => ({ name: field(entity, "name"), category: field(entity, "category") }),
  workout_plans: (entity: RecordEntity) => ({ title: field(entity, "title"), status: field(entity, "status") }),
  workout_sessions: (entity: RecordEntity) => ({ workout_plan_id: field(entity, "workoutPlanId"), title: field(entity, "title"), status: field(entity, "status"), started_at: field(entity, "startedAt"), ended_at: field(entity, "endedAt") }),
  exercise_sets: (entity: RecordEntity) => ({ workout_session_id: field(entity, "workoutSessionId"), exercise_id: field(entity, "exerciseId"), sequence: field(entity, "sequence"), repetitions: nested(entity, "repetitions", "value"), weight_value: nested(entity, "weight", "value"), weight_unit: nested(entity, "weight", "unit") }),
  activity_routes: (entity: RecordEntity) => ({ title: field(entity, "title"), distance_value: nested(entity, "distance", "value"), distance_unit: nested(entity, "distance", "unit") }),
  equipment: (entity: RecordEntity) => ({ name: field(entity, "name"), category: field(entity, "category"), status: field(entity, "status") }),
  running_activities: (entity: RecordEntity) => ({ activity_route_id: field(entity, "routeId"), title: field(entity, "title"), status: field(entity, "status"), started_at: field(entity, "startedAt"), ended_at: field(entity, "endedAt"), distance_value: nested(entity, "distance", "value"), distance_unit: nested(entity, "distance", "unit"), duration_minutes: nested(entity, "duration", "value") }),
  running_splits: (entity: RecordEntity) => ({ running_activity_id: field(entity, "runningActivityId"), sequence: field(entity, "sequence"), distance_value: nested(entity, "distance", "value"), distance_unit: nested(entity, "distance", "unit"), duration_minutes: nested(entity, "duration", "value") }),
  personal_records: (entity: RecordEntity) => {
    const metric = entity.metric;
    const value = objectField(metric, "value");
    return { title: field(entity, "title"), metric_type: objectField(metric, "type"), metric_value: objectField(value, "value"), metric_unit: objectField(value, "unit"), achieved_at: field(entity, "achievedAt") };
  },
  recovery_entries: (entity: RecordEntity) => ({ observed_at: field(entity, "observedAt"), energy_score: nested(entity, "energy", "value"), fatigue_score: nested(entity, "fatigue", "value") }),
} as const;

const entitySchemas = {
  profiles: healthProfileSchema,
  measurements: healthMeasurementSchema,
  vital_readings: vitalReadingSchema,
  body_composition: bodyCompositionRecordSchema,
  sleep_records: sleepRecordSchema,
  nutrition_entries: nutritionEntrySchema,
  hydration_entries: hydrationEntrySchema,
  medications: medicationSchema,
  medication_logs: medicationLogSchema,
  symptom_entries: symptomEntrySchema,
  appointments: appointmentSchema,
  laboratory_results: laboratoryResultSchema,
  exercises: exerciseSchema,
  workout_plans: workoutPlanSchema,
  workout_sessions: workoutSessionSchema,
  exercise_sets: exerciseSetSchema,
  activity_routes: activityRouteSchema,
  equipment: equipmentSchema,
  running_activities: runningActivitySchema,
  running_splits: runningSplitSchema,
  personal_records: personalRecordSchema,
  recovery_entries: recoveryEntrySchema,
} as const;

class HealthPostgresCollection<TEntity extends HealthMemoryEntity>
  extends HealthEntityCollection<TEntity> {
  readonly #durable: PostgresCollection<TEntity>;

  public constructor(database: SqlExecutor, table: keyof typeof projections) {
    super(table, true);
    this.#durable = new PostgresCollection(database, {
      schema: "health",
      table,
      entitySchema: entitySchemas[table] as unknown as RuntimeSchema<TEntity>,
      project: projections[table] as unknown as (entity: TEntity) => Readonly<Record<string, unknown>>,
    });
  }

  public override create(entity: TEntity): Promise<TEntity> { return this.#durable.create(entity); }
  public override update(entity: TEntity): Promise<TEntity> { return this.#durable.update(entity); }
  public override delete(id: string, ownerId: TEntity["ownerId"]): Promise<void> { return this.#durable.delete(id, ownerId); }
  public override findById(id: string, ownerId: TEntity["ownerId"]): Promise<TEntity | null> { return this.#durable.findById(id, ownerId); }
  public override findFirst(ownerId: TEntity["ownerId"], predicate: (entity: TEntity) => boolean): Promise<TEntity | null> { return this.#durable.findFirst(ownerId, predicate); }
  public override findMany<TQuery extends HealthMemoryQuery>(query: TQuery, matches: HealthEntityMatcher<TEntity, TQuery>, compare: HealthEntityComparator<TEntity>) { return this.#durable.findMany(query, matches, compare); }
}

function createProfileRepository(collection: HealthPostgresCollection<HealthProfile>) {
  return Object.freeze({
    findById: (id: string, ownerId: OwnerId) => collection.findById(id, ownerId),
    findByOwner: (ownerId: OwnerId) => collection.findFirst(ownerId, () => true),
    create: (entity: HealthProfile) => collection.create(entity),
    update: (entity: HealthProfile) => collection.update(entity),
  });
}

interface EquipmentUsageEntity extends DurableEntity, RecordEquipmentUsageInput {}

function createEquipmentRepository(
  database: SqlExecutor,
  collection: HealthPostgresCollection<Equipment>,
  generateId: () => string,
): EquipmentRepository {
  const usage = new PostgresCollection<EquipmentUsageEntity>(database, {
    schema: "health",
    table: "equipment_usage",
    project: (entity) => ({ equipment_id: entity.equipmentId, used_at: entity.createdAt }),
  });
  const base = {
    create: (entity: Equipment) => collection.create(entity),
    update: (entity: Equipment) => collection.update(entity),
    delete: (id: EquipmentId, ownerId: OwnerId) => collection.delete(id, ownerId),
    findById: (id: EquipmentId, ownerId: OwnerId) => collection.findById(id, ownerId),
    findMany: (query: EquipmentListQuery) => collection.findMany(
      query,
      (entity, runtimeQuery) =>
        (runtimeQuery.category === undefined || entity.category === runtimeQuery.category) &&
        (runtimeQuery.status === undefined || entity.status === runtimeQuery.status),
      (left, right) => compareText(left.name, right.name),
    ),
  };

  async function requireOwned(id: EquipmentId, ownerId: OwnerId): Promise<void> {
    if (await base.findById(id, ownerId) === null) {
      throw new PostgresRepositoryError(
        "postgres-record-not-found",
        "The requested equipment record is unavailable.",
        { entityId: id },
      );
    }
  }

  async function getUsageSummary(id: EquipmentId, ownerId: OwnerId): Promise<EquipmentUsageSummary> {
    await requireOwned(id, ownerId);
    const entries = (await usage.findMany(
      { ownerId },
      (entity) => entity.equipmentId === id,
      (left, right) => left.createdAt.localeCompare(right.createdAt),
    )).items;
    if (entries.length === 0) return equipmentUsageSummarySchema.parse({ equipmentId: id, useCount: 0 });
    const calculation = calculateRunningSummary({
      activities: entries.map((entry) => ({
        distance: entry.distance ?? { value: "0", unit: "kilometer" },
        duration: entry.duration ?? { value: "0", unit: "second" },
      })),
      outputDistanceUnit: "kilometer",
    });
    return equipmentUsageSummarySchema.parse({
      equipmentId: id,
      useCount: entries.length,
      ...(entries.some((entry) => entry.distance !== undefined) ? { totalDistance: calculation.totalDistance } : {}),
      ...(entries.some((entry) => entry.duration !== undefined) ? { totalDuration: calculation.totalDuration } : {}),
    });
  }

  return Object.freeze({
    ...base,
    async recordUsage(input: RecordEquipmentUsageInput) {
      await requireOwned(input.equipmentId, input.ownerId);
      const now = new Date().toISOString();
      await usage.create({ ...input, id: generateId(), createdAt: now, updatedAt: now });
      return getUsageSummary(input.equipmentId, input.ownerId);
    },
    getUsageSummary,
  });
}

export interface CreateHealthPostgresRepositoryOptions {
  readonly generateId?: () => string;
}

export function createHealthPostgresRepository(
  database: SqlExecutor,
  options: CreateHealthPostgresRepositoryOptions = {},
): HealthRepository {
  const collection = <TEntity extends HealthMemoryEntity>(table: keyof typeof projections) =>
    new HealthPostgresCollection<TEntity>(database, table);
  const equipment = collection<Equipment>("equipment");

  return Object.freeze({
    profiles: createProfileRepository(collection<HealthProfile>("profiles")),
    measurements: Object.freeze(createHealthMeasurementMemoryRepository(collection<HealthMeasurement>("measurements"))),
    vitalReadings: Object.freeze(createVitalReadingMemoryRepository(collection<VitalReading>("vital_readings"))),
    bodyComposition: Object.freeze(createBodyCompositionMemoryRepository(collection<BodyCompositionRecord>("body_composition"))),
    sleepRecords: Object.freeze(createSleepRecordMemoryRepository(collection<SleepRecord>("sleep_records"))),
    nutritionEntries: Object.freeze(createNutritionEntryMemoryRepository(collection<NutritionEntry>("nutrition_entries"))),
    hydrationEntries: Object.freeze(createHydrationEntryMemoryRepository(collection<HydrationEntry>("hydration_entries"))),
    medications: Object.freeze(createMedicationMemoryRepository(collection<Medication>("medications"))),
    medicationLogs: Object.freeze(createMedicationLogMemoryRepository(collection<MedicationLog>("medication_logs"))),
    symptomEntries: Object.freeze(createSymptomEntryMemoryRepository(collection<SymptomEntry>("symptom_entries"))),
    appointments: Object.freeze(createAppointmentMemoryRepository(collection<Appointment>("appointments"))),
    laboratoryResults: Object.freeze(createLaboratoryResultMemoryRepository(collection<LaboratoryResult>("laboratory_results"))),
    exercises: Object.freeze(createExerciseMemoryRepository(collection<Exercise>("exercises"))),
    workoutPlans: Object.freeze(createWorkoutPlanMemoryRepository(collection<WorkoutPlan>("workout_plans"))),
    workoutSessions: Object.freeze(createWorkoutSessionMemoryRepository(collection<WorkoutSession>("workout_sessions"))),
    exerciseSets: Object.freeze(createExerciseSetMemoryRepository(collection<ExerciseSet>("exercise_sets"))),
    runningActivities: Object.freeze(createRunningActivityMemoryRepository(collection<RunningActivity>("running_activities"))),
    runningSplits: Object.freeze(createRunningSplitMemoryRepository(collection<RunningSplit>("running_splits"))),
    activityRoutes: Object.freeze(createActivityRouteMemoryRepository(collection<ActivityRoute>("activity_routes"))),
    equipment: createEquipmentRepository(database, equipment, options.generateId ?? generateUuid),
    personalRecords: Object.freeze(createPersonalRecordMemoryRepository(collection<PersonalRecord>("personal_records"))),
    recoveryEntries: Object.freeze(createRecoveryEntryMemoryRepository(collection<RecoveryEntry>("recovery_entries"))),
  });
}
