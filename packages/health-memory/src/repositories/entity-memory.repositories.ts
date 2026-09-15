import type {
  ActivityRoute,
  ActivityRouteId,
  ActivityRouteListQuery,
  ActivityRouteRepository,
  Appointment,
  AppointmentId,
  AppointmentListQuery,
  AppointmentRepository,
  BodyCompositionListQuery,
  BodyCompositionRecord,
  BodyCompositionRecordId,
  BodyCompositionRepository,
  Exercise,
  ExerciseId,
  ExerciseListQuery,
  ExerciseRepository,
  ExerciseSet,
  ExerciseSetId,
  ExerciseSetListQuery,
  ExerciseSetRepository,
  HealthMeasurement,
  HealthMeasurementId,
  HealthMeasurementListQuery,
  HealthMeasurementRepository,
  HydrationEntry,
  HydrationEntryId,
  HydrationEntryListQuery,
  HydrationEntryRepository,
  LaboratoryResult,
  LaboratoryResultId,
  LaboratoryResultListQuery,
  LaboratoryResultRepository,
  Medication,
  MedicationId,
  MedicationListQuery,
  MedicationLog,
  MedicationLogId,
  MedicationLogListQuery,
  MedicationLogRepository,
  MedicationRepository,
  NutritionEntry,
  NutritionEntryId,
  NutritionEntryListQuery,
  NutritionEntryRepository,
  OwnerId,
  PageResult,
  PersonalRecord,
  PersonalRecordId,
  PersonalRecordListQuery,
  PersonalRecordRepository,
  RecoveryEntry,
  RecoveryEntryId,
  RecoveryEntryListQuery,
  RecoveryEntryRepository,
  RunningActivity,
  RunningActivityId,
  RunningActivityListQuery,
  RunningActivityRepository,
  RunningSplit,
  RunningSplitId,
  RunningSplitListQuery,
  RunningSplitRepository,
  SleepRecord,
  SleepRecordId,
  SleepRecordListQuery,
  SleepRecordRepository,
  SymptomEntry,
  SymptomEntryId,
  SymptomEntryListQuery,
  SymptomEntryRepository,
  VitalReading,
  VitalReadingId,
  VitalReadingListQuery,
  VitalReadingRepository,
  WorkoutPlan,
  WorkoutPlanId,
  WorkoutPlanListQuery,
  WorkoutPlanRepository,
  WorkoutSession,
  WorkoutSessionId,
  WorkoutSessionListQuery,
  WorkoutSessionRepository,
} from "@aperture/health";

import {
  compareNumber,
  compareOptionalText,
  compareText,
  type EntityCollection,
  type EntityComparator,
  type MemoryEntity,
  type MemoryQuery,
} from "../store/entity-collection.js";
import { compareIsoTimestamps, timestampInRange } from "../store/iso-timestamp.js";

interface RuntimeHealthQuery extends MemoryQuery {
  readonly status?: string;
  readonly type?: string;
  readonly category?: string;
  readonly exerciseId?: string;
  readonly workoutSessionId?: string;
  readonly runningActivityId?: string;
  readonly medicationId?: string;
  readonly startsBefore?: string;
  readonly date?: string;
  readonly range?: {
    readonly startsAt: string;
    readonly endsAt: string;
  };
}

type RuntimeMatcher<TEntity> = (entity: TEntity, query: RuntimeHealthQuery) => boolean;

export function createMemoryCrud<
  TEntity extends MemoryEntity,
  TId extends string,
  TQuery extends MemoryQuery,
>(
  collection: EntityCollection<TEntity>,
  matches: RuntimeMatcher<TEntity>,
  compare: EntityComparator<TEntity>,
) {
  return {
    create: (entity: TEntity): Promise<TEntity> => collection.create(entity),
    update: (entity: TEntity): Promise<TEntity> => collection.update(entity),
    delete: (id: TId, ownerId: OwnerId): Promise<void> => collection.delete(id, ownerId),
    findById: (id: TId, ownerId: OwnerId): Promise<TEntity | null> => collection.findById(id, ownerId),
    findMany: (query: TQuery): Promise<PageResult<TEntity>> => collection.findMany(
      query,
      (entity) => matches(entity, query as unknown as RuntimeHealthQuery),
      compare,
    ),
  };
}

function matchesRange(query: RuntimeHealthQuery, timestamp: string): boolean {
  return query.range === undefined ||
    timestampInRange(timestamp, query.range.startsAt, query.range.endsAt);
}

function matchesDate(query: RuntimeHealthQuery, timestamp: string): boolean {
  return query.date === undefined || timestamp.startsWith(query.date);
}

export function createAppointmentMemoryRepository(collection: EntityCollection<Appointment>): AppointmentRepository {
  return createMemoryCrud<Appointment, AppointmentId, AppointmentListQuery>(
    collection,
    (entity, query) =>
      (query.status === undefined || entity.status === query.status) &&
      (query.startsBefore === undefined || compareIsoTimestamps(entity.startsAt, query.startsBefore) <= 0),
    (left, right) => compareIsoTimestamps(left.startsAt, right.startsAt),
  );
}

export function createBodyCompositionMemoryRepository(collection: EntityCollection<BodyCompositionRecord>): BodyCompositionRepository {
  return createMemoryCrud<BodyCompositionRecord, BodyCompositionRecordId, BodyCompositionListQuery>(
    collection,
    () => true,
    (left, right) => compareIsoTimestamps(left.observedAt, right.observedAt),
  );
}

export function createExerciseSetMemoryRepository(collection: EntityCollection<ExerciseSet>): ExerciseSetRepository {
  return createMemoryCrud<ExerciseSet, ExerciseSetId, ExerciseSetListQuery>(
    collection,
    (entity, query) =>
      (query.workoutSessionId === undefined || entity.workoutSessionId === query.workoutSessionId) &&
      (query.exerciseId === undefined || entity.exerciseId === query.exerciseId),
    (left, right) => compareNumber(left.sequence, right.sequence),
  );
}

export function createExerciseMemoryRepository(collection: EntityCollection<Exercise>): ExerciseRepository {
  return createMemoryCrud<Exercise, ExerciseId, ExerciseListQuery>(
    collection,
    (entity, query) =>
      (query.category === undefined || entity.category === query.category) &&
      (query.status === undefined || entity.status === query.status),
    (left, right) => compareText(left.name, right.name),
  );
}

export function createHydrationEntryMemoryRepository(collection: EntityCollection<HydrationEntry>): HydrationEntryRepository {
  return createMemoryCrud<HydrationEntry, HydrationEntryId, HydrationEntryListQuery>(
    collection,
    (entity, query) => matchesDate(query, entity.consumedAt),
    (left, right) => compareIsoTimestamps(left.consumedAt, right.consumedAt),
  );
}

export function createLaboratoryResultMemoryRepository(collection: EntityCollection<LaboratoryResult>): LaboratoryResultRepository {
  return createMemoryCrud<LaboratoryResult, LaboratoryResultId, LaboratoryResultListQuery>(
    collection,
    () => true,
    (left, right) => compareIsoTimestamps(left.collectedAt, right.collectedAt),
  );
}

export function createHealthMeasurementMemoryRepository(collection: EntityCollection<HealthMeasurement>): HealthMeasurementRepository {
  return createMemoryCrud<HealthMeasurement, HealthMeasurementId, HealthMeasurementListQuery>(
    collection,
    (entity, query) =>
      (query.type === undefined || entity.type === query.type) && matchesRange(query, entity.observedAt),
    (left, right) => compareIsoTimestamps(left.observedAt, right.observedAt),
  );
}

export function createMedicationMemoryRepository(collection: EntityCollection<Medication>): MedicationRepository {
  return createMemoryCrud<Medication, MedicationId, MedicationListQuery>(
    collection,
    (entity, query) => query.status === undefined || entity.status === query.status,
    (left, right) => compareText(left.name, right.name),
  );
}

export function createMedicationLogMemoryRepository(collection: EntityCollection<MedicationLog>): MedicationLogRepository {
  return createMemoryCrud<MedicationLog, MedicationLogId, MedicationLogListQuery>(
    collection,
    (entity, query) => query.medicationId === undefined || entity.medicationId === query.medicationId,
    (left, right) => compareIsoTimestamps(left.recordedAt, right.recordedAt),
  );
}

export function createNutritionEntryMemoryRepository(collection: EntityCollection<NutritionEntry>): NutritionEntryRepository {
  return createMemoryCrud<NutritionEntry, NutritionEntryId, NutritionEntryListQuery>(
    collection,
    (entity, query) => matchesDate(query, entity.consumedAt),
    (left, right) => compareIsoTimestamps(left.consumedAt, right.consumedAt),
  );
}

export function createPersonalRecordMemoryRepository(collection: EntityCollection<PersonalRecord>): PersonalRecordRepository {
  return createMemoryCrud<PersonalRecord, PersonalRecordId, PersonalRecordListQuery>(
    collection,
    (entity, query) => query.exerciseId === undefined || entity.exerciseId === query.exerciseId,
    (left, right) => compareIsoTimestamps(left.achievedAt, right.achievedAt),
  );
}

export function createRecoveryEntryMemoryRepository(collection: EntityCollection<RecoveryEntry>): RecoveryEntryRepository {
  return createMemoryCrud<RecoveryEntry, RecoveryEntryId, RecoveryEntryListQuery>(
    collection,
    () => true,
    (left, right) => compareIsoTimestamps(left.observedAt, right.observedAt),
  );
}

export function createActivityRouteMemoryRepository(collection: EntityCollection<ActivityRoute>): ActivityRouteRepository {
  return createMemoryCrud<ActivityRoute, ActivityRouteId, ActivityRouteListQuery>(
    collection,
    () => true,
    (left, right) => compareText(left.title, right.title),
  );
}

export function createRunningSplitMemoryRepository(collection: EntityCollection<RunningSplit>): RunningSplitRepository {
  return createMemoryCrud<RunningSplit, RunningSplitId, RunningSplitListQuery>(
    collection,
    (entity, query) => query.runningActivityId === undefined || entity.runningActivityId === query.runningActivityId,
    (left, right) => compareNumber(left.sequence, right.sequence),
  );
}

export function createRunningActivityMemoryRepository(collection: EntityCollection<RunningActivity>): RunningActivityRepository {
  return createMemoryCrud<RunningActivity, RunningActivityId, RunningActivityListQuery>(
    collection,
    (entity, query) => matchesRange(query, entity.startedAt),
    (left, right) => compareIsoTimestamps(left.startedAt, right.startedAt),
  );
}

export function createSleepRecordMemoryRepository(collection: EntityCollection<SleepRecord>): SleepRecordRepository {
  return createMemoryCrud<SleepRecord, SleepRecordId, SleepRecordListQuery>(
    collection,
    (entity, query) => matchesRange(query, entity.startedAt),
    (left, right) => compareIsoTimestamps(left.startedAt, right.startedAt),
  );
}

export function createSymptomEntryMemoryRepository(collection: EntityCollection<SymptomEntry>): SymptomEntryRepository {
  return createMemoryCrud<SymptomEntry, SymptomEntryId, SymptomEntryListQuery>(
    collection,
    () => true,
    (left, right) => compareIsoTimestamps(left.observedAt, right.observedAt),
  );
}

export function createVitalReadingMemoryRepository(collection: EntityCollection<VitalReading>): VitalReadingRepository {
  return createMemoryCrud<VitalReading, VitalReadingId, VitalReadingListQuery>(
    collection,
    (entity, query) =>
      (query.type === undefined || entity.reading.type === query.type) && matchesRange(query, entity.observedAt),
    (left, right) => compareIsoTimestamps(left.observedAt, right.observedAt),
  );
}

export function createWorkoutPlanMemoryRepository(collection: EntityCollection<WorkoutPlan>): WorkoutPlanRepository {
  return createMemoryCrud<WorkoutPlan, WorkoutPlanId, WorkoutPlanListQuery>(
    collection,
    (entity, query) => query.status === undefined || entity.status === query.status,
    (left, right) => compareOptionalText(left.startsOn, right.startsOn) || compareText(left.title, right.title),
  );
}

export function createWorkoutSessionMemoryRepository(collection: EntityCollection<WorkoutSession>): WorkoutSessionRepository {
  return createMemoryCrud<WorkoutSession, WorkoutSessionId, WorkoutSessionListQuery>(
    collection,
    (entity, query) => matchesRange(query, entity.scheduledAt ?? entity.startedAt ?? entity.createdAt),
    (left, right) => compareIsoTimestamps(
      left.scheduledAt ?? left.startedAt ?? left.createdAt,
      right.scheduledAt ?? right.startedAt ?? right.createdAt,
    ),
  );
}
