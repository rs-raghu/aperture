import type {
  ActivityRoute,
  Appointment,
  BodyCompositionRecord,
  Equipment,
  Exercise,
  ExerciseSet,
  HealthMeasurement,
  HealthProfile,
  HydrationEntry,
  LaboratoryResult,
  Medication,
  MedicationLog,
  NutritionEntry,
  PersonalRecord,
  RecoveryEntry,
  RunningActivity,
  RunningSplit,
  SleepRecord,
  SymptomEntry,
  VitalReading,
  WorkoutPlan,
  WorkoutSession,
} from "@aperture/health";

export const OWNER_A = "synthetic-owner-a";
export const OWNER_B = "synthetic-owner-b";
export const CREATED_AT = "2040-01-01T08:00:00Z";
export const UPDATED_AT = "2040-01-01T09:00:00Z";

export const FIXTURE_IDS = {
  profile: "fixture-profile",
  measurement: "fixture-measurement",
  vital: "fixture-vital",
  bodyComposition: "fixture-body-composition",
  sleep: "fixture-sleep",
  nutrition: "fixture-nutrition",
  hydration: "fixture-hydration",
  medication: "fixture-medication",
  medicationLog: "fixture-medication-log",
  symptom: "fixture-symptom",
  appointment: "fixture-appointment",
  laboratory: "fixture-laboratory",
  exercise: "fixture-exercise",
  workoutPlan: "fixture-workout-plan",
  workout: "fixture-workout",
  exerciseSet: "fixture-exercise-set",
  running: "fixture-running",
  runningSplit: "fixture-running-split",
  route: "fixture-route",
  equipment: "fixture-equipment",
  personalRecord: "fixture-personal-record",
  recovery: "fixture-recovery",
  alternate: "fixture-alternate",
} as const;

const metadata = { ownerId: OWNER_A, createdAt: CREATED_AT, updatedAt: UPDATED_AT } as const;

function fixture<TEntity>(base: TEntity, overrides: Partial<TEntity>): TEntity {
  return { ...base, ...overrides };
}

export function buildHealthProfile(overrides: Partial<HealthProfile> = {}): HealthProfile {
  return fixture({ ...metadata, id: FIXTURE_IDS.profile, measurementSystem: "metric", status: "active" }, overrides);
}

export function buildHealthMeasurement(overrides: Partial<HealthMeasurement> = {}): HealthMeasurement {
  return fixture({ ...metadata, id: FIXTURE_IDS.measurement, type: "weight", measurement: { value: "70.25", unit: "kilogram" }, observedAt: "2040-01-02T08:00:00Z" }, overrides);
}

export function buildVitalReading(overrides: Partial<VitalReading> = {}): VitalReading {
  return fixture({ ...metadata, id: FIXTURE_IDS.vital, reading: { type: "resting_heart_rate", value: { value: 60, unit: "beats_per_minute" } }, observedAt: "2040-01-02T08:00:00Z" }, overrides);
}

export function buildBodyComposition(overrides: Partial<BodyCompositionRecord> = {}): BodyCompositionRecord {
  return fixture({ ...metadata, id: FIXTURE_IDS.bodyComposition, observedAt: "2040-01-02T08:00:00Z", weight: { value: "70.25", unit: "kilogram" } }, overrides);
}

export function buildSleepRecord(overrides: Partial<SleepRecord> = {}): SleepRecord {
  return fixture({ ...metadata, id: FIXTURE_IDS.sleep, startedAt: "2040-01-02T22:00:00Z", endedAt: "2040-01-03T06:00:00Z", duration: { value: "8", unit: "hour" }, quality: "good" }, overrides);
}

export function buildNutritionEntry(overrides: Partial<NutritionEntry> = {}): NutritionEntry {
  return fixture({ ...metadata, id: FIXTURE_IDS.nutrition, title: "Synthetic breakfast", mealType: "breakfast", consumedAt: "2040-01-02T08:30:00Z", energy: { value: "400", unit: "kilocalorie" } }, overrides);
}

export function buildHydrationEntry(overrides: Partial<HydrationEntry> = {}): HydrationEntry {
  return fixture({ ...metadata, id: FIXTURE_IDS.hydration, volume: { value: "500", unit: "milliliter" }, consumedAt: "2040-01-02T09:00:00Z" }, overrides);
}

export function buildMedication(overrides: Partial<Medication> = {}): Medication {
  return fixture({ ...metadata, id: FIXTURE_IDS.medication, name: "Synthetic medication", status: "active" }, overrides);
}

export function buildMedicationLog(overrides: Partial<MedicationLog> = {}): MedicationLog {
  return fixture({ ...metadata, id: FIXTURE_IDS.medicationLog, medicationId: FIXTURE_IDS.medication, status: "taken", recordedAt: "2040-01-02T09:30:00Z" }, overrides);
}

export function buildSymptomEntry(overrides: Partial<SymptomEntry> = {}): SymptomEntry {
  return fixture({ ...metadata, id: FIXTURE_IDS.symptom, observation: "Synthetic observation", severity: { value: 2, scale: "zero_to_ten" }, observedAt: "2040-01-02T10:00:00Z" }, overrides);
}

export function buildAppointment(overrides: Partial<Appointment> = {}): Appointment {
  return fixture({ ...metadata, id: FIXTURE_IDS.appointment, title: "Synthetic appointment", status: "scheduled", startsAt: "2040-01-10T10:00:00Z" }, overrides);
}

export function buildLaboratoryResult(overrides: Partial<LaboratoryResult> = {}): LaboratoryResult {
  return fixture({ ...metadata, id: FIXTURE_IDS.laboratory, testName: "Synthetic test", result: { kind: "numeric", value: "1.25", unit: "synthetic-unit" }, collectedAt: "2040-01-02T10:30:00Z" }, overrides);
}

export function buildExercise(overrides: Partial<Exercise> = {}): Exercise {
  return fixture({ ...metadata, id: FIXTURE_IDS.exercise, name: "Synthetic squat", category: "strength", status: "active" }, overrides);
}

export function buildWorkoutPlan(overrides: Partial<WorkoutPlan> = {}): WorkoutPlan {
  return fixture({ ...metadata, id: FIXTURE_IDS.workoutPlan, title: "Synthetic plan", status: "draft", startsOn: "2040-01-01" }, overrides);
}

export function buildWorkoutSession(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return fixture({ ...metadata, id: FIXTURE_IDS.workout, workoutPlanId: FIXTURE_IDS.workoutPlan, title: "Synthetic workout", status: "planned", scheduledAt: "2040-01-03T07:00:00Z" }, overrides);
}

export function buildExerciseSet(overrides: Partial<ExerciseSet> = {}): ExerciseSet {
  return fixture({ ...metadata, id: FIXTURE_IDS.exerciseSet, workoutSessionId: FIXTURE_IDS.workout, exerciseId: FIXTURE_IDS.exercise, sequence: 1, repetitions: { value: 8, unit: "repetition" }, weight: { value: "40", unit: "kilogram" } }, overrides);
}

export function buildRunningActivity(overrides: Partial<RunningActivity> = {}): RunningActivity {
  return fixture({ ...metadata, id: FIXTURE_IDS.running, workoutSessionId: FIXTURE_IDS.workout, routeId: FIXTURE_IDS.route, equipmentIds: [FIXTURE_IDS.equipment], title: "Synthetic run", status: "planned", startedAt: "2040-01-03T07:00:00Z", distance: { value: "5", unit: "kilometer" }, duration: { value: "30", unit: "minute" } }, overrides);
}

export function buildRunningSplit(overrides: Partial<RunningSplit> = {}): RunningSplit {
  return fixture({ ...metadata, id: FIXTURE_IDS.runningSplit, runningActivityId: FIXTURE_IDS.running, sequence: 1, distance: { value: "1", unit: "kilometer" }, duration: { value: "6", unit: "minute" } }, overrides);
}

export function buildActivityRoute(overrides: Partial<ActivityRoute> = {}): ActivityRoute {
  return fixture({ ...metadata, id: FIXTURE_IDS.route, title: "Synthetic route", distance: { value: "5", unit: "kilometer" } }, overrides);
}

export function buildEquipment(overrides: Partial<Equipment> = {}): Equipment {
  return fixture({ ...metadata, id: FIXTURE_IDS.equipment, name: "Synthetic shoes", category: "running_shoes", status: "active" }, overrides);
}

export function buildPersonalRecord(overrides: Partial<PersonalRecord> = {}): PersonalRecord {
  return fixture({ ...metadata, id: FIXTURE_IDS.personalRecord, exerciseId: FIXTURE_IDS.exercise, runningActivityId: FIXTURE_IDS.running, title: "Synthetic distance record", metric: { type: "distance", value: { value: "5", unit: "kilometer" } }, achievedAt: "2040-01-03T08:00:00Z" }, overrides);
}

export function buildRecoveryEntry(overrides: Partial<RecoveryEntry> = {}): RecoveryEntry {
  return fixture({ ...metadata, id: FIXTURE_IDS.recovery, observedAt: "2040-01-03T08:00:00Z", energy: { value: 7, scale: "one_to_ten" }, fatigue: { value: 3, scale: "one_to_ten" } }, overrides);
}
