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

import { EntityCollection } from "./entity-collection.js";

export class HealthMemoryStore {
  public readonly profiles: EntityCollection<HealthProfile>;
  public readonly measurements: EntityCollection<HealthMeasurement>;
  public readonly vitalReadings: EntityCollection<VitalReading>;
  public readonly bodyComposition: EntityCollection<BodyCompositionRecord>;
  public readonly sleepRecords: EntityCollection<SleepRecord>;
  public readonly nutritionEntries: EntityCollection<NutritionEntry>;
  public readonly hydrationEntries: EntityCollection<HydrationEntry>;
  public readonly medications: EntityCollection<Medication>;
  public readonly medicationLogs: EntityCollection<MedicationLog>;
  public readonly symptomEntries: EntityCollection<SymptomEntry>;
  public readonly appointments: EntityCollection<Appointment>;
  public readonly laboratoryResults: EntityCollection<LaboratoryResult>;
  public readonly exercises: EntityCollection<Exercise>;
  public readonly workoutPlans: EntityCollection<WorkoutPlan>;
  public readonly workoutSessions: EntityCollection<WorkoutSession>;
  public readonly exerciseSets: EntityCollection<ExerciseSet>;
  public readonly runningActivities: EntityCollection<RunningActivity>;
  public readonly runningSplits: EntityCollection<RunningSplit>;
  public readonly activityRoutes: EntityCollection<ActivityRoute>;
  public readonly equipment: EntityCollection<Equipment>;
  public readonly personalRecords: EntityCollection<PersonalRecord>;
  public readonly recoveryEntries: EntityCollection<RecoveryEntry>;

  public constructor(cloneValues: boolean) {
    this.profiles = new EntityCollection("profiles", cloneValues);
    this.measurements = new EntityCollection("measurements", cloneValues);
    this.vitalReadings = new EntityCollection("vital-readings", cloneValues);
    this.bodyComposition = new EntityCollection("body-composition", cloneValues);
    this.sleepRecords = new EntityCollection("sleep-records", cloneValues);
    this.nutritionEntries = new EntityCollection("nutrition-entries", cloneValues);
    this.hydrationEntries = new EntityCollection("hydration-entries", cloneValues);
    this.medications = new EntityCollection("medications", cloneValues);
    this.medicationLogs = new EntityCollection("medication-logs", cloneValues);
    this.symptomEntries = new EntityCollection("symptom-entries", cloneValues);
    this.appointments = new EntityCollection("appointments", cloneValues);
    this.laboratoryResults = new EntityCollection("laboratory-results", cloneValues);
    this.exercises = new EntityCollection("exercises", cloneValues);
    this.workoutPlans = new EntityCollection("workout-plans", cloneValues);
    this.workoutSessions = new EntityCollection("workout-sessions", cloneValues);
    this.exerciseSets = new EntityCollection("exercise-sets", cloneValues);
    this.runningActivities = new EntityCollection("running-activities", cloneValues);
    this.runningSplits = new EntityCollection("running-splits", cloneValues);
    this.activityRoutes = new EntityCollection("activity-routes", cloneValues);
    this.equipment = new EntityCollection("equipment", cloneValues);
    this.personalRecords = new EntityCollection("personal-records", cloneValues);
    this.recoveryEntries = new EntityCollection("recovery-entries", cloneValues);
  }
}
