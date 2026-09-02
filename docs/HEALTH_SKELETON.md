# Health domain skeleton inventory

Phase 2 adds the structural `@aperture/health` package. Source modules define types, interfaces, and ambient `declare` function signatures; `src/index.ts` contains explicit re-exports. No source module implements runtime behavior.

## Folder and file inventory

| Folder | Files | Structural purpose |
|---|---|---|
| `packages/health/` | `package.json`, `tsconfig.json` | Private workspace metadata and strict TypeScript boundary. |
| `src/` | `index.ts`, `health.types.ts`, `health.errors.ts`, `health-units.types.ts` | Explicit package exports, shared boundary types, structural errors, and unit-bearing values. |
| `src/profiles/` | `health-profile.types.ts`, `health-profile.contracts.ts`, `health-profile.repository.ts` | Health profile entity, operations, and repository. |
| `src/measurements/` | `health-measurement.types.ts`, `health-measurement.contracts.ts`, `health-measurement.repository.ts` | General body measurement entity, operations, and repository. |
| `src/vitals/` | `vital-reading.types.ts`, `vital-reading.contracts.ts`, `vital-reading.repository.ts` | User-recorded vital observations, operations, and repository. |
| `src/body-composition/` | `body-composition.types.ts`, `body-composition.contracts.ts`, `body-composition.repository.ts` | Body-composition record, operations, and repository. |
| `src/sleep/` | `sleep-record.types.ts`, `sleep-record.contracts.ts`, `sleep-record.repository.ts` | Sleep record, operations, and repository. |
| `src/nutrition/` | `nutrition-entry.types.ts`, `nutrition-entry.contracts.ts`, `nutrition-entry.repository.ts` | Nutrition entry, operations, and repository. |
| `src/hydration/` | `hydration-entry.types.ts`, `hydration-entry.contracts.ts`, `hydration-entry.repository.ts` | Hydration entry, operations, and repository. |
| `src/medications/` | `medication.types.ts`, `medication-log.types.ts`, `medication.contracts.ts`, `medication.repository.ts` | Medication and medication-log entities, shared operations, and two repository interfaces. |
| `src/symptoms/` | `symptom-entry.types.ts`, `symptom-entry.contracts.ts`, `symptom-entry.repository.ts` | User-recorded symptom observation, operations, and repository. |
| `src/appointments/` | `appointment.types.ts`, `appointment.contracts.ts`, `appointment.repository.ts` | Appointment entity, lifecycle operations, and repository. |
| `src/laboratory-results/` | `laboratory-result.types.ts`, `laboratory-result.contracts.ts`, `laboratory-result.repository.ts` | Uninterpreted laboratory result, operations, and repository. |
| `src/exercises/` | `exercise.types.ts`, `exercise.contracts.ts`, `exercise.repository.ts` | Exercise catalog entity, operations, and repository. |
| `src/workout-plans/` | `workout-plan.types.ts`, `workout-plan.contracts.ts`, `workout-plan.repository.ts` | User-authored workout-plan shape, operations, and repository. |
| `src/workouts/` | `workout-session.types.ts`, `workout-session.contracts.ts`, `workout-session.repository.ts` | Workout session, lifecycle operations, and repository. |
| `src/exercise-sets/` | `exercise-set.types.ts`, `exercise-set.contracts.ts`, `exercise-set.repository.ts` | Exercise-set performance record, operations, and repository. |
| `src/running/` | `running-activity.types.ts`, `running-activity.contracts.ts`, `running-activity.repository.ts` | Running activity, operations, and repository. |
| `src/running-splits/` | `running-split.types.ts`, `running-split.contracts.ts`, `running-split.repository.ts` | Running split, operations, and repository. |
| `src/routes/` | `activity-route.types.ts`, `activity-route.contracts.ts`, `activity-route.repository.ts` | Route metadata without mapping or GPS processing. |
| `src/equipment/` | `equipment.types.ts`, `equipment.contracts.ts`, `equipment.repository.ts` | Running/workout equipment, usage summaries, operations, and repository. |
| `src/personal-records/` | `personal-record.types.ts`, `personal-record.contracts.ts`, `personal-record.repository.ts` | Explicitly recorded personal record, operations, and repository. |
| `src/recovery/` | `recovery-entry.types.ts`, `recovery-entry.contracts.ts`, `recovery-entry.repository.ts` | User-recorded recovery observations, operations, and repository. |
| `src/calculations/` | `bmi.contracts.ts`, `bmr.contracts.ts`, `tdee.contracts.ts`, `heart-rate-zones.contracts.ts`, `running-pace.contracts.ts`, `running-summary.contracts.ts`, `workout-volume.contracts.ts`, `one-rep-max.contracts.ts`, `sleep-summary.contracts.ts`, `hydration-summary.contracts.ts`, `recovery-summary.contracts.ts` | Unit-documented input/result shapes and eleven ambient calculation declarations. |
| `src/repositories/` | `repository.types.ts`, `health-repository.contract.ts` | Generic repository interfaces and readonly aggregate repository. |
| `src/services/` | `health-service.contract.ts` | High-level summary and orchestration interface. |

This table lists every Phase 2 Health folder and file.

## Principal entities and relationships

All persisted entity shapes carry an opaque string ID, an owner placeholder, and ISO creation/update timestamps.

| Entity | Identifier | Main structural relationships |
|---|---|---|
| Health profile | `HealthProfileId` | Belongs to an owner and records measurement-system preference. |
| Health measurement | `HealthMeasurementId` | Belongs to an owner and carries one typed measurement value. |
| Vital reading | `VitalReadingId` | Belongs to an owner and carries one discriminated vital value. |
| Body-composition record | `BodyCompositionRecordId` | Groups optional body measurements observed together. |
| Sleep record | `SleepRecordId` | Records one bounded sleep interval. |
| Nutrition entry | `NutritionEntryId` | Records one consumed item or meal and optional nutrient quantities. |
| Hydration entry | `HydrationEntryId` | Records one consumed volume. |
| Medication | `MedicationId` | Owns medication-log records; contains no dosage advice. |
| Medication log | `MedicationLogId` | References a medication and records taken or skipped status. |
| Symptom entry | `SymptomEntryId` | Stores a user-recorded observation, not a diagnosis. |
| Appointment | `AppointmentId` | Records scheduled timing and lifecycle state. |
| Laboratory result | `LaboratoryResultId` | Stores an uninterpreted numeric-with-unit or text result. |
| Exercise | `ExerciseId` | Referenced by exercise sets and optional personal records. |
| Workout plan | `WorkoutPlanId` | May be referenced by workout sessions. |
| Workout session | `WorkoutSessionId` | Owns exercise sets and may be linked to a running activity or equipment usage. |
| Exercise set | `ExerciseSetId` | References a workout session and exercise. |
| Running activity | `RunningActivityId` | May reference a workout session, route, and equipment; owns splits. |
| Running split | `RunningSplitId` | References one running activity. |
| Activity route | `ActivityRouteId` | May be referenced by running activities; contains no GPS processing. |
| Equipment | `EquipmentId` | May be referenced by workout or running usage records. |
| Personal record | `PersonalRecordId` | May reference an exercise or running activity and is explicitly recorded. |
| Recovery entry | `RecoveryEntryId` | Groups user-recorded recovery observations. |

## Domain operation contracts

| Contract | Declared functions |
|---|---|
| Health profile | `createHealthProfile`, `updateHealthProfile`, `getHealthProfile` |
| Health measurement | `recordHealthMeasurement`, `updateHealthMeasurement`, `deleteHealthMeasurement`, `getHealthMeasurement`, `listHealthMeasurements`, `listHealthMeasurementsByType`, `listHealthMeasurementsByDateRange` |
| Vital reading | `recordVitalReading`, `updateVitalReading`, `deleteVitalReading`, `getVitalReading`, `listVitalReadings`, `listVitalReadingsByType`, `listVitalReadingsByDateRange` |
| Body composition | `recordBodyComposition`, `updateBodyComposition`, `deleteBodyComposition`, `getBodyComposition`, `listBodyCompositionRecords` |
| Sleep | `recordSleep`, `updateSleep`, `deleteSleep`, `getSleepRecord`, `listSleepRecords`, `listSleepRecordsByDateRange` |
| Nutrition | `createNutritionEntry`, `updateNutritionEntry`, `deleteNutritionEntry`, `getNutritionEntry`, `listNutritionEntries`, `listNutritionEntriesByDate` |
| Hydration | `recordHydration`, `updateHydrationEntry`, `deleteHydrationEntry`, `getHydrationEntry`, `listHydrationEntries`, `listHydrationEntriesByDate` |
| Medication | `createMedication`, `updateMedication`, `archiveMedication`, `getMedication`, `listMedications`, `recordMedicationTaken`, `recordMedicationSkipped`, `updateMedicationLog`, `listMedicationLogs` |
| Symptom | `recordSymptom`, `updateSymptomEntry`, `deleteSymptomEntry`, `getSymptomEntry`, `listSymptomEntries` |
| Appointment | `createAppointment`, `updateAppointment`, `cancelAppointment`, `completeAppointment`, `getAppointment`, `listAppointments`, `listUpcomingAppointments` |
| Laboratory result | `recordLaboratoryResult`, `updateLaboratoryResult`, `deleteLaboratoryResult`, `getLaboratoryResult`, `listLaboratoryResults` |
| Exercise | `createExercise`, `updateExercise`, `archiveExercise`, `getExercise`, `listExercises`, `listExercisesByCategory` |
| Workout plan | `createWorkoutPlan`, `updateWorkoutPlan`, `archiveWorkoutPlan`, `activateWorkoutPlan`, `getWorkoutPlan`, `listWorkoutPlans` |
| Workout session | `createWorkoutSession`, `startWorkout`, `pauseWorkout`, `resumeWorkout`, `completeWorkout`, `cancelWorkout`, `getWorkoutSession`, `listWorkoutSessions`, `listWorkoutSessionsByDateRange` |
| Exercise set | `recordExerciseSet`, `updateExerciseSet`, `deleteExerciseSet`, `getExerciseSet`, `listExerciseSetsByWorkout`, `listExerciseSetsByExercise` |
| Running activity | `createRunningActivity`, `updateRunningActivity`, `completeRunningActivity`, `deleteRunningActivity`, `getRunningActivity`, `listRunningActivities`, `listRunningActivitiesByDateRange` |
| Running split | `recordRunningSplit`, `updateRunningSplit`, `deleteRunningSplit`, `listRunningSplitsByActivity` |
| Activity route | `createActivityRoute`, `updateActivityRoute`, `deleteActivityRoute`, `getActivityRoute`, `listActivityRoutes` |
| Equipment | `createEquipment`, `updateEquipment`, `retireEquipment`, `getEquipment`, `listEquipment`, `recordEquipmentUsage`, `getEquipmentUsageSummary` |
| Personal record | `recordPersonalRecord`, `updatePersonalRecord`, `deletePersonalRecord`, `getPersonalRecord`, `listPersonalRecords` |
| Recovery | `recordRecoveryEntry`, `updateRecoveryEntry`, `deleteRecoveryEntry`, `getRecoveryEntry`, `listRecoveryEntries` |

The 126 domain-operation names above are ambient declarations with typed inputs and outputs and no bodies.

## Calculation contracts

| File | Declaration | Unit and estimate contract |
|---|---|---|
| `bmi.contracts.ts` | `calculateBmi` | Weight and height in; kilograms per square meter out; not an estimate. |
| `bmr.contracts.ts` | `calculateBmr` | Weight, height, and age in; energy per day out; estimate. |
| `tdee.contracts.ts` | `calculateTdee` | Energy per day and ratio in; energy per day out; estimate. |
| `heart-rate-zones.contracts.ts` | `calculateHeartRateZones` | Beats per minute and percentage boundaries in; beats-per-minute bounds out; estimate. |
| `running-pace.contracts.ts` | `calculateRunningPace` | Distance and duration in; seconds per kilometer or mile out; not an estimate. |
| `running-summary.contracts.ts` | `calculateRunningSummary` | Unit-bearing distances/durations in and out; not an estimate. |
| `workout-volume.contracts.ts` | `calculateWorkoutVolume` | Weight and repetitions in; weight-repetition load out; not an estimate. |
| `one-rep-max.contracts.ts` | `estimateOneRepMax` | Weight and repetitions in; weight out; estimate. |
| `sleep-summary.contracts.ts` | `calculateSleepSummary` | Unit-bearing durations in and out; not an estimate. |
| `hydration-summary.contracts.ts` | `calculateHydrationSummary` | Unit-bearing volumes in and out; not an estimate. |
| `recovery-summary.contracts.ts` | `calculateRecoverySummary` | One-to-ten observations and unit-bearing physiology in; one-to-ten aggregates out; estimate. |

Every calculation contract states that no formula is implemented in Phase 2. None supplies diagnostic meaning or advice.

## Repository and service contracts

`ReadRepository`, `WriteRepository`, and `CrudRepository` provide structural `findById`, `findMany`, `create`, `update`, and `delete` signatures. Twenty-two entity repository interfaces specialize that surface, including separate medication and medication-log repositories. `HealthRepository` exposes every repository through readonly properties. No repository has a runtime implementation or storage dependency.

`HealthService` declares eleven future orchestration methods: health overview, latest measurements, daily health summary, sleep summary, hydration summary, workout summary, running summary, equipment usage summary, recovery summary, upcoming medication reminders, and upcoming appointments. The interface contains no implementation.

## Unit conventions

- `DecimalString` is reserved where decimal precision may matter; Phase 2 performs no parsing.
- Weight: kilograms or pounds.
- Height: centimeters or inches.
- Distance: meters, kilometers, feet, or miles.
- Duration: seconds, minutes, or hours.
- Pace: seconds per kilometer or seconds per mile.
- Speed: kilometers per hour, miles per hour, or meters per second.
- Heart rate: beats per minute; heart-rate variability: milliseconds.
- Blood pressure: millimeters of mercury.
- Temperature: Celsius or Fahrenheit.
- Energy: kilocalories or kilojoules.
- Hydration volume: milliliters, liters, or fluid ounces.
- Nutrition mass: milligrams, grams, or ounces.
- Blood glucose: milligrams per deciliter or millimoles per liter.
- Oxygen saturation and other percentages: percent.
- Repetitions: repetition count; workout load: kilogram-repetitions or pound-repetitions.

No unit conversion functions exist.

## Medical-safety boundaries and exclusions

Vital readings, symptoms, laboratory results, measurements, and recovery entries are neutral observations. The contracts do not interpret values, define diagnostic thresholds, prescribe medication, recommend nutrition or exercise, calculate readiness, generate training plans, or automatically determine personal records.

Phase 2 also excludes React, Next.js, Expo, Supabase, APIs, authentication, database code or migrations, runtime repositories, validation, synchronization, wearable or Strava integrations, mapping and GPS processing, mock/seed data, and behavior tests.

## Completion checklist

- [x] All 22 required opaque identifier aliases and principal entity shapes exist.
- [x] All required Health, body, sleep, nutrition, hydration, medication, symptom, appointment, and laboratory contracts exist.
- [x] All required exercise, plan, workout, set, running, split, route, equipment, personal-record, and recovery contracts exist.
- [x] All 126 required domain-operation functions are ambient typed declarations.
- [x] All 11 required calculation functions have input/output units, estimate status, and no formula body.
- [x] All 22 entity repositories and the readonly aggregate repository exist as interfaces only.
- [x] The service interface covers all 11 required orchestration areas.
- [x] The package index explicitly exports the complete supported surface without wildcard exports.
- [x] No runtime behavior, diagnosis, advice, threshold, UI, API, authentication, persistence, integration, mock, or seed data exists.
- [x] Phase 1 Education remains part of the passing root workspace type-check.
- [x] Phase 3 has not started.
