import type { HealthRepository } from "@aperture/health";

import type { CreateHealthMemoryRepositoryOptions } from "./health-memory.types.js";
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
} from "./repositories/entity-memory.repositories.js";
import { createEquipmentMemoryRepository } from "./repositories/equipment-memory.repository.js";
import { createHealthProfileMemoryRepository } from "./repositories/profile-memory.repository.js";
import { HealthMemoryStore } from "./store/memory-store.js";

export function createHealthMemoryRepository(
  options: CreateHealthMemoryRepositoryOptions = {},
): HealthRepository {
  const cloneValues = options.cloneValues ?? true;
  const store = new HealthMemoryStore(cloneValues);
  return Object.freeze({
    profiles: Object.freeze(createHealthProfileMemoryRepository(store.profiles)),
    measurements: Object.freeze(createHealthMeasurementMemoryRepository(store.measurements)),
    vitalReadings: Object.freeze(createVitalReadingMemoryRepository(store.vitalReadings)),
    bodyComposition: Object.freeze(createBodyCompositionMemoryRepository(store.bodyComposition)),
    sleepRecords: Object.freeze(createSleepRecordMemoryRepository(store.sleepRecords)),
    nutritionEntries: Object.freeze(createNutritionEntryMemoryRepository(store.nutritionEntries)),
    hydrationEntries: Object.freeze(createHydrationEntryMemoryRepository(store.hydrationEntries)),
    medications: Object.freeze(createMedicationMemoryRepository(store.medications)),
    medicationLogs: Object.freeze(createMedicationLogMemoryRepository(store.medicationLogs)),
    symptomEntries: Object.freeze(createSymptomEntryMemoryRepository(store.symptomEntries)),
    appointments: Object.freeze(createAppointmentMemoryRepository(store.appointments)),
    laboratoryResults: Object.freeze(createLaboratoryResultMemoryRepository(store.laboratoryResults)),
    exercises: Object.freeze(createExerciseMemoryRepository(store.exercises)),
    workoutPlans: Object.freeze(createWorkoutPlanMemoryRepository(store.workoutPlans)),
    workoutSessions: Object.freeze(createWorkoutSessionMemoryRepository(store.workoutSessions)),
    exerciseSets: Object.freeze(createExerciseSetMemoryRepository(store.exerciseSets)),
    runningActivities: Object.freeze(createRunningActivityMemoryRepository(store.runningActivities)),
    runningSplits: Object.freeze(createRunningSplitMemoryRepository(store.runningSplits)),
    activityRoutes: Object.freeze(createActivityRouteMemoryRepository(store.activityRoutes)),
    equipment: Object.freeze(createEquipmentMemoryRepository(store.equipment, cloneValues)),
    personalRecords: Object.freeze(createPersonalRecordMemoryRepository(store.personalRecords)),
    recoveryEntries: Object.freeze(createRecoveryEntryMemoryRepository(store.recoveryEntries)),
  });
}
