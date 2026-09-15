import {
  collectOwned,
  createEntity,
  listOwned,
  materializeEntity,
  parseApplicationInput,
  parseCreateInput,
  rejectOwnerField,
  requireParent,
  transitionOwned,
  validateApplicationResult,
  validateContext,
  verifyOwnedResult,
} from "../application/application.helpers.js";
import { createCrudUseCases } from "../application/crud-use-cases.js";
import { HealthApplicationError } from "../application/application.errors.js";
import {
  calculateHydrationSummary,
  calculateRecoverySummary,
  calculateRunningSummary,
  calculateSleepSummary,
} from "../calculations.js";
import { isoDateStringSchema, isoDateTimeStringSchema } from "../health.types.js";
import { compareInstants, instantParts } from "../internal/validation.helpers.js";
import * as appointmentContracts from "../appointments/appointment.contracts.js";
import * as appointmentTypes from "../appointments/appointment.types.js";
import * as bodyCompositionContracts from "../body-composition/body-composition.contracts.js";
import * as bodyCompositionTypes from "../body-composition/body-composition.types.js";
import * as equipmentContracts from "../equipment/equipment.contracts.js";
import * as equipmentTypes from "../equipment/equipment.types.js";
import * as exerciseSetContracts from "../exercise-sets/exercise-set.contracts.js";
import * as exerciseSetTypes from "../exercise-sets/exercise-set.types.js";
import * as exerciseContracts from "../exercises/exercise.contracts.js";
import * as exerciseTypes from "../exercises/exercise.types.js";
import * as hydrationContracts from "../hydration/hydration-entry.contracts.js";
import * as hydrationTypes from "../hydration/hydration-entry.types.js";
import * as laboratoryContracts from "../laboratory-results/laboratory-result.contracts.js";
import * as laboratoryTypes from "../laboratory-results/laboratory-result.types.js";
import * as measurementContracts from "../measurements/health-measurement.contracts.js";
import * as measurementTypes from "../measurements/health-measurement.types.js";
import * as medicationContracts from "../medications/medication.contracts.js";
import * as medicationLogTypes from "../medications/medication-log.types.js";
import * as medicationTypes from "../medications/medication.types.js";
import * as nutritionContracts from "../nutrition/nutrition-entry.contracts.js";
import * as nutritionTypes from "../nutrition/nutrition-entry.types.js";
import * as personalRecordContracts from "../personal-records/personal-record.contracts.js";
import * as personalRecordTypes from "../personal-records/personal-record.types.js";
import * as profileContracts from "../profiles/health-profile.contracts.js";
import * as profileTypes from "../profiles/health-profile.types.js";
import * as recoveryContracts from "../recovery/recovery-entry.contracts.js";
import * as recoveryTypes from "../recovery/recovery-entry.types.js";
import * as routeContracts from "../routes/activity-route.contracts.js";
import * as routeTypes from "../routes/activity-route.types.js";
import * as runningContracts from "../running/running-activity.contracts.js";
import * as runningTypes from "../running/running-activity.types.js";
import * as splitContracts from "../running-splits/running-split.contracts.js";
import * as splitTypes from "../running-splits/running-split.types.js";
import * as sleepContracts from "../sleep/sleep-record.contracts.js";
import * as sleepTypes from "../sleep/sleep-record.types.js";
import * as symptomContracts from "../symptoms/symptom-entry.contracts.js";
import * as symptomTypes from "../symptoms/symptom-entry.types.js";
import * as vitalContracts from "../vitals/vital-reading.contracts.js";
import * as vitalTypes from "../vitals/vital-reading.types.js";
import * as workoutPlanContracts from "../workout-plans/workout-plan.contracts.js";
import * as workoutPlanTypes from "../workout-plans/workout-plan.types.js";
import * as workoutContracts from "../workouts/workout-session.contracts.js";
import * as workoutTypes from "../workouts/workout-session.types.js";
import {
  dailyHealthSummarySchema,
  dateRangeSummaryQuerySchema,
  healthOverviewSchema,
  latestMeasurementsResultSchema,
  upcomingAppointmentsResultSchema,
  upcomingItemsQuerySchema,
  upcomingMedicationRemindersResultSchema,
  workoutSummarySchema,
} from "./health-service.contract.js";
import { Decimal } from "decimal.js";
import type { ContextualQuery, HealthOperationContext, OwnerScopedInput } from "../application/application.types.js";
import type { HealthServiceDependencies } from "../application/dependencies.js";
import type { IsoDateString, IsoDateTimeString, OwnerId } from "../health.types.js";
import type { DurationValue } from "../health-units.types.js";
import type { DateRangeSummaryQuery, HealthService, UpcomingItemsQuery, WorkoutSummary } from "./health-service.contract.js";

function durationBetween(startedAt?: string, endedAt?: string): DurationValue | undefined {
  if (startedAt === undefined || endedAt === undefined) return undefined;
  if (compareInstants(startedAt, endedAt) > 0) return undefined;
  const [startSecond, startFraction] = instantParts(startedAt);
  const [endSecond, endFraction] = instantParts(endedAt);
  const seconds = new Decimal(endSecond).minus(startSecond).dividedBy(1000)
    .plus(new Decimal(`0.${endFraction}`).minus(`0.${startFraction}`));
  return { value: seconds.toFixed(), unit: "second" };
}

function rejectDirectStatusUpdate(input: { readonly status?: string | undefined }, entityType: string): void {
  if (input.status !== undefined) {
    throw new HealthApplicationError(
      "health-invalid-state-transition",
      `${entityType} status must be changed through its lifecycle operation.`,
      { entityType, toState: input.status },
    );
  }
}

export function createHealthService(dependencies: HealthServiceDependencies) {
  const { repositories } = dependencies;

  const appointments = createCrudUseCases(dependencies, repositories.appointments, {
    entityType: "appointment",
    createSchema: appointmentContracts.createAppointmentInputSchema,
    updateSchema: appointmentContracts.updateAppointmentInputSchema,
    querySchema: appointmentContracts.appointmentListQuerySchema,
    entitySchema: appointmentTypes.appointmentSchema,
    defaults: { status: "scheduled" },
    hooks: { beforeUpdate: async (input) => rejectDirectStatusUpdate(input, "appointment") },
  });
  const bodyComposition = createCrudUseCases(dependencies, repositories.bodyComposition, {
    entityType: "body composition record",
    createSchema: bodyCompositionContracts.recordBodyCompositionInputSchema,
    updateSchema: bodyCompositionContracts.updateBodyCompositionInputSchema,
    querySchema: bodyCompositionContracts.bodyCompositionListQuerySchema,
    entitySchema: bodyCompositionTypes.bodyCompositionRecordSchema,
  });
  const equipment = createCrudUseCases(dependencies, repositories.equipment, {
    entityType: "equipment",
    createSchema: equipmentContracts.createEquipmentInputSchema,
    updateSchema: equipmentContracts.updateEquipmentInputSchema,
    querySchema: equipmentContracts.equipmentListQuerySchema,
    entitySchema: equipmentTypes.equipmentSchema,
    defaults: { status: "active" },
    hooks: { beforeUpdate: async (input) => rejectDirectStatusUpdate(input, "equipment") },
  });
  const exercises = createCrudUseCases(dependencies, repositories.exercises, {
    entityType: "exercise",
    createSchema: exerciseContracts.createExerciseInputSchema,
    updateSchema: exerciseContracts.updateExerciseInputSchema,
    querySchema: exerciseContracts.exerciseListQuerySchema,
    entitySchema: exerciseTypes.exerciseSchema,
    defaults: { status: "active" },
    hooks: { beforeUpdate: async (input) => rejectDirectStatusUpdate(input, "exercise") },
  });
  const hydration = createCrudUseCases(dependencies, repositories.hydrationEntries, {
    entityType: "hydration entry",
    createSchema: hydrationContracts.recordHydrationInputSchema,
    updateSchema: hydrationContracts.updateHydrationEntryInputSchema,
    querySchema: hydrationContracts.hydrationEntryListQuerySchema,
    entitySchema: hydrationTypes.hydrationEntrySchema,
  });
  const laboratory = createCrudUseCases(dependencies, repositories.laboratoryResults, {
    entityType: "laboratory result",
    createSchema: laboratoryContracts.recordLaboratoryResultInputSchema,
    updateSchema: laboratoryContracts.updateLaboratoryResultInputSchema,
    querySchema: laboratoryContracts.laboratoryResultListQuerySchema,
    entitySchema: laboratoryTypes.laboratoryResultSchema,
  });
  const measurements = createCrudUseCases(dependencies, repositories.measurements, {
    entityType: "health measurement",
    createSchema: measurementContracts.recordHealthMeasurementInputSchema,
    updateSchema: measurementContracts.updateHealthMeasurementInputSchema,
    querySchema: measurementContracts.healthMeasurementListQuerySchema,
    entitySchema: measurementTypes.healthMeasurementSchema,
  });
  const medications = createCrudUseCases(dependencies, repositories.medications, {
    entityType: "medication",
    createSchema: medicationContracts.createMedicationInputSchema,
    updateSchema: medicationContracts.updateMedicationInputSchema,
    querySchema: medicationContracts.medicationListQuerySchema,
    entitySchema: medicationTypes.medicationSchema,
    defaults: { status: "active" },
    hooks: { beforeUpdate: async (input) => rejectDirectStatusUpdate(input, "medication") },
  });
  const medicationLogs = createCrudUseCases(dependencies, repositories.medicationLogs, {
    entityType: "medication log",
    createSchema: medicationContracts.recordMedicationLogInputSchema,
    updateSchema: medicationContracts.updateMedicationLogInputSchema,
    querySchema: medicationContracts.medicationLogListQuerySchema,
    entitySchema: medicationLogTypes.medicationLogSchema,
    hooks: {
      beforeCreate: async (input, context) => {
        await requireParent(repositories.medications, input.medicationId, context, medicationTypes.medicationSchema, "medication");
      },
    },
  });
  const nutrition = createCrudUseCases(dependencies, repositories.nutritionEntries, {
    entityType: "nutrition entry",
    createSchema: nutritionContracts.createNutritionEntryInputSchema,
    updateSchema: nutritionContracts.updateNutritionEntryInputSchema,
    querySchema: nutritionContracts.nutritionEntryListQuerySchema,
    entitySchema: nutritionTypes.nutritionEntrySchema,
  });
  const recovery = createCrudUseCases(dependencies, repositories.recoveryEntries, {
    entityType: "recovery entry",
    createSchema: recoveryContracts.recordRecoveryEntryInputSchema,
    updateSchema: recoveryContracts.updateRecoveryEntryInputSchema,
    querySchema: recoveryContracts.recoveryEntryListQuerySchema,
    entitySchema: recoveryTypes.recoveryEntrySchema,
  });
  const routes = createCrudUseCases(dependencies, repositories.activityRoutes, {
    entityType: "activity route",
    createSchema: routeContracts.createActivityRouteInputSchema,
    updateSchema: routeContracts.updateActivityRouteInputSchema,
    querySchema: routeContracts.activityRouteListQuerySchema,
    entitySchema: routeTypes.activityRouteSchema,
  });
  const sleep = createCrudUseCases(dependencies, repositories.sleepRecords, {
    entityType: "sleep record",
    createSchema: sleepContracts.recordSleepInputSchema,
    updateSchema: sleepContracts.updateSleepInputSchema,
    querySchema: sleepContracts.sleepRecordListQuerySchema,
    entitySchema: sleepTypes.sleepRecordSchema,
  });
  const symptoms = createCrudUseCases(dependencies, repositories.symptomEntries, {
    entityType: "symptom entry",
    createSchema: symptomContracts.recordSymptomInputSchema,
    updateSchema: symptomContracts.updateSymptomEntryInputSchema,
    querySchema: symptomContracts.symptomEntryListQuerySchema,
    entitySchema: symptomTypes.symptomEntrySchema,
  });
  const vitals = createCrudUseCases(dependencies, repositories.vitalReadings, {
    entityType: "vital reading",
    createSchema: vitalContracts.recordVitalReadingInputSchema,
    updateSchema: vitalContracts.updateVitalReadingInputSchema,
    querySchema: vitalContracts.vitalReadingListQuerySchema,
    entitySchema: vitalTypes.vitalReadingSchema,
  });
  const workoutPlans = createCrudUseCases(dependencies, repositories.workoutPlans, {
    entityType: "workout plan",
    createSchema: workoutPlanContracts.createWorkoutPlanInputSchema,
    updateSchema: workoutPlanContracts.updateWorkoutPlanInputSchema,
    querySchema: workoutPlanContracts.workoutPlanListQuerySchema,
    entitySchema: workoutPlanTypes.workoutPlanSchema,
    defaults: { status: "draft" },
    hooks: { beforeUpdate: async (input) => rejectDirectStatusUpdate(input, "workout plan") },
  });
  const workouts = createCrudUseCases(dependencies, repositories.workoutSessions, {
    entityType: "workout session",
    createSchema: workoutContracts.createWorkoutSessionInputSchema,
    updateSchema: workoutContracts.updateWorkoutSessionInputSchema,
    querySchema: workoutContracts.workoutSessionListQuerySchema,
    entitySchema: workoutTypes.workoutSessionSchema,
    defaults: { status: "planned" },
    hooks: {
      beforeCreate: async (input, context) => {
        if (input.workoutPlanId !== undefined) {
          await requireParent(repositories.workoutPlans, input.workoutPlanId, context, workoutPlanTypes.workoutPlanSchema, "workout plan");
        }
      },
      beforeUpdate: async (input, context) => {
        if (input.workoutPlanId !== undefined) {
          await requireParent(repositories.workoutPlans, input.workoutPlanId, context, workoutPlanTypes.workoutPlanSchema, "workout plan");
        }
      },
    },
  });

  const exerciseSets = createCrudUseCases(dependencies, repositories.exerciseSets, {
    entityType: "exercise set",
    createSchema: exerciseSetContracts.recordExerciseSetInputSchema,
    updateSchema: exerciseSetContracts.updateExerciseSetInputSchema,
    querySchema: exerciseSetContracts.exerciseSetListQuerySchema,
    entitySchema: exerciseSetTypes.exerciseSetSchema,
    hooks: {
      beforeCreate: async (input, context) => {
        await requireParent(repositories.workoutSessions, input.workoutSessionId, context, workoutTypes.workoutSessionSchema, "workout session");
        await requireParent(repositories.exercises, input.exerciseId, context, exerciseTypes.exerciseSchema, "exercise");
      },
    },
  });

  const running = createCrudUseCases(dependencies, repositories.runningActivities, {
    entityType: "running activity",
    createSchema: runningContracts.createRunningActivityInputSchema,
    updateSchema: runningContracts.updateRunningActivityInputSchema,
    querySchema: runningContracts.runningActivityListQuerySchema,
    entitySchema: runningTypes.runningActivitySchema,
    defaults: { status: "in_progress" },
    hooks: {
      beforeCreate: async (input, context) => {
        if (input.workoutSessionId !== undefined) await requireParent(repositories.workoutSessions, input.workoutSessionId, context, workoutTypes.workoutSessionSchema, "workout session");
        if (input.routeId !== undefined) await requireParent(repositories.activityRoutes, input.routeId, context, routeTypes.activityRouteSchema, "activity route");
        for (const equipmentId of input.equipmentIds ?? []) await requireParent(repositories.equipment, equipmentId, context, equipmentTypes.equipmentSchema, "equipment");
      },
      beforeUpdate: async (input, context) => {
        if (input.routeId !== undefined) await requireParent(repositories.activityRoutes, input.routeId, context, routeTypes.activityRouteSchema, "activity route");
        for (const equipmentId of input.equipmentIds ?? []) await requireParent(repositories.equipment, equipmentId, context, equipmentTypes.equipmentSchema, "equipment");
      },
    },
  });

  const splits = createCrudUseCases(dependencies, repositories.runningSplits, {
    entityType: "running split",
    createSchema: splitContracts.recordRunningSplitInputSchema,
    updateSchema: splitContracts.updateRunningSplitInputSchema,
    querySchema: splitContracts.runningSplitListQuerySchema,
    entitySchema: splitTypes.runningSplitSchema,
    hooks: {
      beforeCreate: async (input, context) => {
        await requireParent(repositories.runningActivities, input.runningActivityId, context, runningTypes.runningActivitySchema, "running activity");
      },
    },
  });

  const personalRecords = createCrudUseCases(dependencies, repositories.personalRecords, {
    entityType: "personal record",
    createSchema: personalRecordContracts.recordPersonalRecordInputSchema,
    updateSchema: personalRecordContracts.updatePersonalRecordInputSchema,
    querySchema: personalRecordContracts.personalRecordListQuerySchema,
    entitySchema: personalRecordTypes.personalRecordSchema,
    hooks: {
      beforeCreate: async (input, context) => {
        if (input.exerciseId !== undefined) await requireParent(repositories.exercises, input.exerciseId, context, exerciseTypes.exerciseSchema, "exercise");
        if (input.runningActivityId !== undefined) await requireParent(repositories.runningActivities, input.runningActivityId, context, runningTypes.runningActivitySchema, "running activity");
      },
    },
  });

  async function createHealthProfile(
    context: HealthOperationContext,
    input: OwnerScopedInput<profileContracts.CreateHealthProfileInput>,
  ): Promise<profileTypes.HealthProfile> {
    const parsed = parseCreateInput(context, input, profileContracts.createHealthProfileInputSchema);
    if (await repositories.profiles.findByOwner(parsed.ownerId) !== null) {
      throw new HealthApplicationError("health-conflict", "A health profile already exists for this owner.", { entityType: "health profile" });
    }
    const entity = materializeEntity(dependencies, parsed, { status: "active" }, profileTypes.healthProfileSchema);
    if (await repositories.profiles.findById(entity.id, entity.ownerId) !== null) {
      throw new HealthApplicationError("health-conflict", "Health profile identifier already exists.", { entityType: "health profile", entityId: entity.id });
    }
    const stored = await repositories.profiles.create(entity);
    return verifyOwnedResult(profileTypes.healthProfileSchema, stored, entity.ownerId, entity.id);
  }

  async function getHealthProfile(context: HealthOperationContext): Promise<profileTypes.HealthProfile | null> {
    const ownerId = validateContext(context).ownerId;
    const entity = await repositories.profiles.findByOwner(ownerId);
    return entity === null ? null : verifyOwnedResult(profileTypes.healthProfileSchema, entity, ownerId);
  }

  async function updateHealthProfile(
    context: HealthOperationContext,
    id: profileTypes.HealthProfileId,
    input: profileContracts.UpdateHealthProfileInput,
  ): Promise<profileTypes.HealthProfile> {
    rejectOwnerField(input);
    const ownerId = validateContext(context).ownerId;
    const profileId = parseApplicationInput(profileTypes.healthProfileIdSchema, id);
    const existing = await repositories.profiles.findById(profileId, ownerId);
    if (existing === null) throw new HealthApplicationError("health-record-not-found", "Health profile was not found.", { entityType: "health profile", entityId: profileId });
    const verified = verifyOwnedResult(profileTypes.healthProfileSchema, existing, ownerId, profileId);
    const parsed = parseApplicationInput(profileContracts.updateHealthProfileInputSchema, input);
    const entity = parseApplicationInput(profileTypes.healthProfileSchema, { ...verified, ...parsed, updatedAt: dependencies.clock.now() });
    const stored = await repositories.profiles.update(entity);
    return verifyOwnedResult(profileTypes.healthProfileSchema, stored, ownerId, profileId);
  }

  async function checkEquipmentUsageRelationships(
    input: equipmentContracts.RecordEquipmentUsageInput,
    context: HealthOperationContext,
  ): Promise<void> {
    await requireParent(repositories.equipment, input.equipmentId, context, equipmentTypes.equipmentSchema, "equipment");
    if (input.workoutSessionId !== undefined) await requireParent(repositories.workoutSessions, input.workoutSessionId, context, workoutTypes.workoutSessionSchema, "workout session");
    if (input.runningActivityId !== undefined) await requireParent(repositories.runningActivities, input.runningActivityId, context, runningTypes.runningActivitySchema, "running activity");
  }

  const service = {
    createHealthProfile,
    updateHealthProfile,
    getHealthProfile,

    recordHealthMeasurement: measurements.create,
    updateHealthMeasurement: measurements.update,
    deleteHealthMeasurement: measurements.delete,
    getHealthMeasurement: measurements.get,
    listHealthMeasurements: measurements.list,
    listHealthMeasurementsByType: (context: HealthOperationContext, query: ContextualQuery<measurementContracts.HealthMeasurementsByTypeQuery>) =>
      listOwned(repositories.measurements, context, query, measurementContracts.healthMeasurementsByTypeQuerySchema, measurementTypes.healthMeasurementSchema),
    listHealthMeasurementsByDateRange: (context: HealthOperationContext, query: ContextualQuery<measurementContracts.HealthMeasurementsByDateRangeQuery>) =>
      listOwned(repositories.measurements, context, query, measurementContracts.healthMeasurementsByDateRangeQuerySchema, measurementTypes.healthMeasurementSchema),

    recordVitalReading: vitals.create,
    updateVitalReading: vitals.update,
    deleteVitalReading: vitals.delete,
    getVitalReading: vitals.get,
    listVitalReadings: vitals.list,
    listVitalReadingsByType: (context: HealthOperationContext, query: ContextualQuery<vitalContracts.VitalReadingsByTypeQuery>) =>
      listOwned(repositories.vitalReadings, context, query, vitalContracts.vitalReadingsByTypeQuerySchema, vitalTypes.vitalReadingSchema),
    listVitalReadingsByDateRange: (context: HealthOperationContext, query: ContextualQuery<vitalContracts.VitalReadingsByDateRangeQuery>) =>
      listOwned(repositories.vitalReadings, context, query, vitalContracts.vitalReadingsByDateRangeQuerySchema, vitalTypes.vitalReadingSchema),

    recordBodyComposition: bodyComposition.create,
    updateBodyComposition: bodyComposition.update,
    deleteBodyComposition: bodyComposition.delete,
    getBodyComposition: bodyComposition.get,
    listBodyCompositionRecords: bodyComposition.list,

    recordSleep: sleep.create,
    updateSleep: sleep.update,
    deleteSleep: sleep.delete,
    getSleepRecord: sleep.get,
    listSleepRecords: sleep.list,
    listSleepRecordsByDateRange: (context: HealthOperationContext, query: ContextualQuery<sleepContracts.SleepRecordsByDateRangeQuery>) =>
      listOwned(repositories.sleepRecords, context, query, sleepContracts.sleepRecordsByDateRangeQuerySchema, sleepTypes.sleepRecordSchema),

    createNutritionEntry: nutrition.create,
    updateNutritionEntry: nutrition.update,
    deleteNutritionEntry: nutrition.delete,
    getNutritionEntry: nutrition.get,
    listNutritionEntries: nutrition.list,
    listNutritionEntriesByDate: (context: HealthOperationContext, query: ContextualQuery<nutritionContracts.NutritionEntriesByDateQuery>) =>
      listOwned(repositories.nutritionEntries, context, query, nutritionContracts.nutritionEntriesByDateQuerySchema, nutritionTypes.nutritionEntrySchema),

    recordHydration: hydration.create,
    updateHydrationEntry: hydration.update,
    deleteHydrationEntry: hydration.delete,
    getHydrationEntry: hydration.get,
    listHydrationEntries: hydration.list,
    listHydrationEntriesByDate: (context: HealthOperationContext, query: ContextualQuery<hydrationContracts.HydrationEntriesByDateQuery>) =>
      listOwned(repositories.hydrationEntries, context, query, hydrationContracts.hydrationEntriesByDateQuerySchema, hydrationTypes.hydrationEntrySchema),

    createMedication: medications.create,
    updateMedication: medications.update,
    archiveMedication: (context: HealthOperationContext, id: medicationTypes.MedicationId) =>
      transitionOwned(dependencies, repositories.medications, id, context, medicationTypes.medicationSchema, "medication", ["active"], "archived"),
    getMedication: medications.get,
    listMedications: medications.list,
    recordMedicationTaken: async (context: HealthOperationContext, input: OwnerScopedInput<medicationContracts.RecordMedicationLogInput>) => {
      const parsed = parseCreateInput(context, input, medicationContracts.recordMedicationLogInputSchema);
      await requireParent(repositories.medications, parsed.medicationId, context, medicationTypes.medicationSchema, "medication");
      return createEntity(dependencies, repositories.medicationLogs, context, input, medicationContracts.recordMedicationLogInputSchema, medicationLogTypes.medicationLogSchema, "medication log", { status: "taken" });
    },
    recordMedicationSkipped: async (context: HealthOperationContext, input: OwnerScopedInput<medicationContracts.RecordMedicationLogInput>) => {
      const parsed = parseCreateInput(context, input, medicationContracts.recordMedicationLogInputSchema);
      await requireParent(repositories.medications, parsed.medicationId, context, medicationTypes.medicationSchema, "medication");
      return createEntity(dependencies, repositories.medicationLogs, context, input, medicationContracts.recordMedicationLogInputSchema, medicationLogTypes.medicationLogSchema, "medication log", { status: "skipped" });
    },
    updateMedicationLog: medicationLogs.update,
    listMedicationLogs: medicationLogs.list,

    recordSymptom: symptoms.create,
    updateSymptomEntry: symptoms.update,
    deleteSymptomEntry: symptoms.delete,
    getSymptomEntry: symptoms.get,
    listSymptomEntries: symptoms.list,

    createAppointment: appointments.create,
    updateAppointment: appointments.update,
    cancelAppointment: (context: HealthOperationContext, id: appointmentTypes.AppointmentId) =>
      transitionOwned(dependencies, repositories.appointments, id, context, appointmentTypes.appointmentSchema, "appointment", ["scheduled"], "cancelled"),
    completeAppointment: (context: HealthOperationContext, id: appointmentTypes.AppointmentId) =>
      transitionOwned(dependencies, repositories.appointments, id, context, appointmentTypes.appointmentSchema, "appointment", ["scheduled"], "completed"),
    getAppointment: appointments.get,
    listAppointments: appointments.list,
    listUpcomingAppointments: (context: HealthOperationContext, query: ContextualQuery<appointmentContracts.UpcomingAppointmentsQuery> = {}) =>
      listOwned(repositories.appointments, context, query, appointmentContracts.upcomingAppointmentsQuerySchema, appointmentTypes.appointmentSchema),

    recordLaboratoryResult: laboratory.create,
    updateLaboratoryResult: laboratory.update,
    deleteLaboratoryResult: laboratory.delete,
    getLaboratoryResult: laboratory.get,
    listLaboratoryResults: laboratory.list,

    createExercise: exercises.create,
    updateExercise: exercises.update,
    archiveExercise: (context: HealthOperationContext, id: exerciseTypes.ExerciseId) =>
      transitionOwned(dependencies, repositories.exercises, id, context, exerciseTypes.exerciseSchema, "exercise", ["active"], "archived"),
    getExercise: exercises.get,
    listExercises: exercises.list,
    listExercisesByCategory: (context: HealthOperationContext, query: ContextualQuery<exerciseContracts.ExercisesByCategoryQuery>) =>
      listOwned(repositories.exercises, context, query, exerciseContracts.exercisesByCategoryQuerySchema, exerciseTypes.exerciseSchema),

    createWorkoutPlan: workoutPlans.create,
    updateWorkoutPlan: workoutPlans.update,
    archiveWorkoutPlan: (context: HealthOperationContext, id: workoutPlanTypes.WorkoutPlanId) =>
      transitionOwned(dependencies, repositories.workoutPlans, id, context, workoutPlanTypes.workoutPlanSchema, "workout plan", ["draft", "active"], "archived"),
    activateWorkoutPlan: (context: HealthOperationContext, id: workoutPlanTypes.WorkoutPlanId) =>
      transitionOwned(dependencies, repositories.workoutPlans, id, context, workoutPlanTypes.workoutPlanSchema, "workout plan", ["draft"], "active"),
    getWorkoutPlan: workoutPlans.get,
    listWorkoutPlans: workoutPlans.list,

    createWorkoutSession: workouts.create,
    updateWorkoutSession: workouts.update,
    startWorkout: async (context: HealthOperationContext, id: workoutTypes.WorkoutSessionId, startedAt: IsoDateTimeString) => {
      const parsed = parseApplicationInput(isoDateTimeStringSchema, startedAt);
      return transitionOwned(dependencies, repositories.workoutSessions, id, context, workoutTypes.workoutSessionSchema, "workout session", ["planned"], "in_progress", { startedAt: parsed });
    },
    pauseWorkout: async (context: HealthOperationContext, id: workoutTypes.WorkoutSessionId, pausedAt: IsoDateTimeString) => {
      parseApplicationInput(isoDateTimeStringSchema, pausedAt);
      return transitionOwned(dependencies, repositories.workoutSessions, id, context, workoutTypes.workoutSessionSchema, "workout session", ["in_progress"], "paused");
    },
    resumeWorkout: async (context: HealthOperationContext, id: workoutTypes.WorkoutSessionId, resumedAt: IsoDateTimeString) => {
      parseApplicationInput(isoDateTimeStringSchema, resumedAt);
      return transitionOwned(dependencies, repositories.workoutSessions, id, context, workoutTypes.workoutSessionSchema, "workout session", ["paused"], "in_progress");
    },
    completeWorkout: async (context: HealthOperationContext, id: workoutTypes.WorkoutSessionId, completedAt: IsoDateTimeString) => {
      const parsed = parseApplicationInput(isoDateTimeStringSchema, completedAt);
      return transitionOwned(dependencies, repositories.workoutSessions, id, context, workoutTypes.workoutSessionSchema, "workout session", ["in_progress", "paused"], "completed", { endedAt: parsed });
    },
    cancelWorkout: (context: HealthOperationContext, id: workoutTypes.WorkoutSessionId) =>
      transitionOwned(dependencies, repositories.workoutSessions, id, context, workoutTypes.workoutSessionSchema, "workout session", ["planned", "in_progress", "paused"], "cancelled"),
    getWorkoutSession: workouts.get,
    listWorkoutSessions: workouts.list,
    listWorkoutSessionsByDateRange: (context: HealthOperationContext, query: ContextualQuery<workoutContracts.WorkoutSessionsByDateRangeQuery>) =>
      listOwned(repositories.workoutSessions, context, query, workoutContracts.workoutSessionsByDateRangeQuerySchema, workoutTypes.workoutSessionSchema),

    recordExerciseSet: exerciseSets.create,
    updateExerciseSet: exerciseSets.update,
    deleteExerciseSet: exerciseSets.delete,
    getExerciseSet: exerciseSets.get,
    listExerciseSetsByWorkout: (context: HealthOperationContext, query: ContextualQuery<exerciseSetContracts.ExerciseSetsByWorkoutQuery>) =>
      listOwned(repositories.exerciseSets, context, query, exerciseSetContracts.exerciseSetsByWorkoutQuerySchema, exerciseSetTypes.exerciseSetSchema),
    listExerciseSetsByExercise: (context: HealthOperationContext, query: ContextualQuery<exerciseSetContracts.ExerciseSetsByExerciseQuery>) =>
      listOwned(repositories.exerciseSets, context, query, exerciseSetContracts.exerciseSetsByExerciseQuerySchema, exerciseSetTypes.exerciseSetSchema),

    createRunningActivity: running.create,
    updateRunningActivity: running.update,
    completeRunningActivity: async (context: HealthOperationContext, id: runningTypes.RunningActivityId, completedAt: IsoDateTimeString) => {
      const parsed = parseApplicationInput(isoDateTimeStringSchema, completedAt);
      return transitionOwned(dependencies, repositories.runningActivities, id, context, runningTypes.runningActivitySchema, "running activity", ["planned", "in_progress"], "completed", { endedAt: parsed });
    },
    deleteRunningActivity: running.delete,
    getRunningActivity: running.get,
    listRunningActivities: running.list,
    listRunningActivitiesByDateRange: (context: HealthOperationContext, query: ContextualQuery<runningContracts.RunningActivitiesByDateRangeQuery>) =>
      listOwned(repositories.runningActivities, context, query, runningContracts.runningActivitiesByDateRangeQuerySchema, runningTypes.runningActivitySchema),

    recordRunningSplit: splits.create,
    updateRunningSplit: splits.update,
    deleteRunningSplit: splits.delete,
    listRunningSplitsByActivity: (context: HealthOperationContext, query: ContextualQuery<splitContracts.RunningSplitsByActivityQuery>) =>
      listOwned(repositories.runningSplits, context, query, splitContracts.runningSplitsByActivityQuerySchema, splitTypes.runningSplitSchema),

    createActivityRoute: routes.create,
    updateActivityRoute: routes.update,
    deleteActivityRoute: routes.delete,
    getActivityRoute: routes.get,
    listActivityRoutes: routes.list,

    createEquipment: equipment.create,
    updateEquipment: equipment.update,
    retireEquipment: (context: HealthOperationContext, id: equipmentTypes.EquipmentId) =>
      transitionOwned(dependencies, repositories.equipment, id, context, equipmentTypes.equipmentSchema, "equipment", ["active"], "retired"),
    getEquipment: equipment.get,
    listEquipment: equipment.list,
    recordEquipmentUsage: async (context: HealthOperationContext, input: OwnerScopedInput<equipmentContracts.RecordEquipmentUsageInput>) => {
      const parsed = parseCreateInput(context, input, equipmentContracts.recordEquipmentUsageInputSchema);
      await checkEquipmentUsageRelationships(parsed, context);
      const result = await repositories.equipment.recordUsage(parsed);
      return parseApplicationInput(equipmentTypes.equipmentUsageSummarySchema, result);
    },

    recordPersonalRecord: personalRecords.create,
    updatePersonalRecord: personalRecords.update,
    deletePersonalRecord: personalRecords.delete,
    getPersonalRecord: personalRecords.get,
    listPersonalRecords: personalRecords.list,

    recordRecoveryEntry: recovery.create,
    updateRecoveryEntry: recovery.update,
    deleteRecoveryEntry: recovery.delete,
    getRecoveryEntry: recovery.get,
    listRecoveryEntries: recovery.list,

    async getHealthOverview(ownerId: OwnerId) {
      const context = { ownerId };
      const [latest, workoutItems, appointmentItems] = await Promise.all([
        collectOwned(repositories.measurements, context, {}, measurementContracts.healthMeasurementListQuerySchema, measurementTypes.healthMeasurementSchema),
        collectOwned(repositories.workoutSessions, context, {}, workoutContracts.workoutSessionListQuerySchema, workoutTypes.workoutSessionSchema),
        collectOwned(repositories.appointments, context, { status: "scheduled" }, appointmentContracts.appointmentListQuerySchema, appointmentTypes.appointmentSchema),
      ]);
      const latestTypes = new Set(latest.map((item) => item.type));
      const now = dependencies.clock.now();
      return parseApplicationInput(healthOverviewSchema, {
        latestMeasurementCount: latestTypes.size,
        recentWorkoutCount: workoutItems.length,
        upcomingAppointmentCount: appointmentItems.filter((item) => compareInstants(item.startsAt, now) >= 0).length,
      });
    },

    async getLatestMeasurements(ownerId: OwnerId) {
      const items = await collectOwned(repositories.measurements, { ownerId }, {}, measurementContracts.healthMeasurementListQuerySchema, measurementTypes.healthMeasurementSchema);
      const latest = new Map<string, measurementTypes.HealthMeasurement>();
      for (const item of [...items].sort((left, right) => compareInstants(right.observedAt, left.observedAt))) {
        if (!latest.has(item.type)) latest.set(item.type, item);
      }
      return parseApplicationInput(latestMeasurementsResultSchema, [...latest.values()]);
    },

    async getDailyHealthSummary(ownerId: OwnerId, date: IsoDateString) {
      const parsedDate = parseApplicationInput(isoDateStringSchema, date);
      const range = { startsAt: `${parsedDate}T00:00:00Z`, endsAt: `${parsedDate}T23:59:59.999999999Z` };
      const context = { ownerId };
      const [measurementItems, vitalItems, hydrationItems, nutritionItems] = await Promise.all([
        collectOwned(repositories.measurements, context, { range }, measurementContracts.healthMeasurementsByDateRangeQuerySchema, measurementTypes.healthMeasurementSchema),
        collectOwned(repositories.vitalReadings, context, { range }, vitalContracts.vitalReadingsByDateRangeQuerySchema, vitalTypes.vitalReadingSchema),
        collectOwned(repositories.hydrationEntries, context, { date }, hydrationContracts.hydrationEntriesByDateQuerySchema, hydrationTypes.hydrationEntrySchema),
        collectOwned(repositories.nutritionEntries, context, { date }, nutritionContracts.nutritionEntriesByDateQuerySchema, nutritionTypes.nutritionEntrySchema),
      ]);
      return parseApplicationInput(dailyHealthSummarySchema, { date: parsedDate, measurementCount: measurementItems.length, vitalReadingCount: vitalItems.length, hydrationEntryCount: hydrationItems.length, nutritionEntryCount: nutritionItems.length });
    },

    async getSleepSummary(query: DateRangeSummaryQuery) {
      const parsed = parseApplicationInput(dateRangeSummaryQuerySchema, query);
      const items = await collectOwned(repositories.sleepRecords,
        { ownerId: parsed.ownerId },
        { range: parsed.range },
        sleepContracts.sleepRecordsByDateRangeQuerySchema,
        sleepTypes.sleepRecordSchema,
      );
      const durations = items.flatMap((record) => record.duration === undefined ? [] : [record.duration]);
      return calculateSleepSummary({ durations, outputUnit: "hour" });
    },

    async getHydrationSummary(query: DateRangeSummaryQuery) {
      const parsed = parseApplicationInput(dateRangeSummaryQuerySchema, query);
      const items = await collectOwned(repositories.hydrationEntries, { ownerId: parsed.ownerId }, {}, hydrationContracts.hydrationEntryListQuerySchema, hydrationTypes.hydrationEntrySchema);
      const volumes = items
        .filter((entry) => compareInstants(entry.consumedAt, parsed.range.startsAt) >= 0 && compareInstants(entry.consumedAt, parsed.range.endsAt) <= 0)
        .map((entry) => entry.volume);
      return calculateHydrationSummary({ volumes, outputUnit: "liter" });
    },

    async getWorkoutSummary(query: DateRangeSummaryQuery) {
      const parsed = parseApplicationInput(dateRangeSummaryQuerySchema, query);
      const items = await collectOwned(repositories.workoutSessions,
        { ownerId: parsed.ownerId },
        { range: parsed.range },
        workoutContracts.workoutSessionsByDateRangeQuerySchema,
        workoutTypes.workoutSessionSchema,
      );
      const durations = items.flatMap((workout) => {
        const duration = durationBetween(workout.startedAt, workout.endedAt);
        return duration === undefined ? [] : [duration];
      });
      const seconds = durations.reduce((total, duration) => total.plus(duration.value), new Decimal(0));
      const result: WorkoutSummary = {
        range: parsed.range,
        workoutCount: items.length,
        completedWorkoutCount: items.filter((workout) => workout.status === "completed").length,
        ...(durations.length === 0 ? {} : { totalDuration: { value: seconds.toFixed(), unit: "second" as const } }),
      };
      return validateApplicationResult(workoutSummarySchema, result);
    },

    async getRunningSummary(query: DateRangeSummaryQuery) {
      const parsed = parseApplicationInput(dateRangeSummaryQuerySchema, query);
      const items = await collectOwned(repositories.runningActivities,
        { ownerId: parsed.ownerId },
        { range: parsed.range },
        runningContracts.runningActivitiesByDateRangeQuerySchema,
        runningTypes.runningActivitySchema,
      );
      const activities = items.flatMap((activity) =>
        activity.distance === undefined || activity.duration === undefined ? [] : [{ distance: activity.distance, duration: activity.duration }]);
      return calculateRunningSummary({ activities, outputDistanceUnit: "kilometer" });
    },

    async getEquipmentUsageSummary(ownerOrContext: OwnerId | HealthOperationContext, equipmentId: equipmentTypes.EquipmentId) {
      const context = typeof ownerOrContext === "string" ? { ownerId: ownerOrContext } : ownerOrContext;
      const owned = await requireParent(repositories.equipment, equipmentId, context, equipmentTypes.equipmentSchema, "equipment");
      const result = parseApplicationInput(equipmentTypes.equipmentUsageSummarySchema, await repositories.equipment.getUsageSummary(equipmentId, owned.ownerId));
      if (result.equipmentId !== equipmentId) throw new HealthApplicationError("health-repository-contract-violation", "Equipment summary identity does not match the request.", { entityType: "equipment", entityId: equipmentId });
      return result;
    },

    async getRecoverySummary(query: DateRangeSummaryQuery) {
      const parsed = parseApplicationInput(dateRangeSummaryQuerySchema, query);
      const items = await collectOwned(repositories.recoveryEntries, { ownerId: parsed.ownerId }, {}, recoveryContracts.recoveryEntryListQuerySchema, recoveryTypes.recoveryEntrySchema);
      const entries = items
        .filter((entry) => compareInstants(entry.observedAt, parsed.range.startsAt) >= 0 && compareInstants(entry.observedAt, parsed.range.endsAt) <= 0)
        .map((entry) => ({
          ...(entry.energy === undefined ? {} : { energy: entry.energy }),
          ...(entry.soreness === undefined ? {} : { soreness: entry.soreness }),
          ...(entry.fatigue === undefined ? {} : { fatigue: entry.fatigue }),
          ...(entry.mood === undefined ? {} : { mood: entry.mood }),
          ...(entry.restingHeartRate === undefined ? {} : { restingHeartRate: entry.restingHeartRate }),
          ...(entry.heartRateVariability === undefined ? {} : { heartRateVariability: entry.heartRateVariability }),
        }));
      return calculateRecoverySummary({ entries });
    },

    async getUpcomingMedicationReminders(query: UpcomingItemsQuery) {
      parseApplicationInput(upcomingItemsQuerySchema, query);
      return parseApplicationInput(upcomingMedicationRemindersResultSchema, []);
    },

    async getUpcomingAppointments(query: UpcomingItemsQuery) {
      const parsed = parseApplicationInput(upcomingItemsQuerySchema, query);
      const items = await collectOwned(repositories.appointments,
        { ownerId: parsed.ownerId },
        {
          ...(parsed.before === undefined ? {} : { startsBefore: parsed.before }),
        },
        appointmentContracts.upcomingAppointmentsQuerySchema,
        appointmentTypes.appointmentSchema,
      );
      return parseApplicationInput(upcomingAppointmentsResultSchema, items
        .filter((appointment) => appointment.status === "scheduled" && compareInstants(appointment.startsAt, dependencies.clock.now()) >= 0)
        .slice(0, parsed.limit ?? 50));
    },
  } satisfies HealthService & Record<string, unknown>;

  return Object.freeze(service);
}

export type HealthApplicationService = ReturnType<typeof createHealthService>;
