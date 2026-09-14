// Synthetic fixtures transcribed from the Phase 2 declaration inventory.
import * as health from "@aperture/health";
import type { ZodType } from "@aperture/validation";

export interface ModelCase {
  readonly name: string;
  readonly schema: ZodType<unknown>;
  readonly full: Readonly<Record<string, unknown>>;
  readonly required: readonly string[];
  readonly optional: readonly string[];
  readonly update: boolean;
}

export const modelCases: readonly ModelCase[] = [
  {
    name: "WeightValue", schema: health.weightValueSchema,
    full: {"value":"1.2500","unit":"kilogram"} satisfies health.WeightValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "HeightValue", schema: health.heightValueSchema,
    full: {"value":"1.2500","unit":"centimeter"} satisfies health.HeightValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "DistanceValue", schema: health.distanceValueSchema,
    full: {"value":"1.2500","unit":"meter"} satisfies health.DistanceValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "DurationValue", schema: health.durationValueSchema,
    full: {"value":"1.2500","unit":"second"} satisfies health.DurationValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "PaceValue", schema: health.paceValueSchema,
    full: {"value":"1.2500","unit":"seconds_per_kilometer"} satisfies health.PaceValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "SpeedValue", schema: health.speedValueSchema,
    full: {"value":"1.2500","unit":"kilometers_per_hour"} satisfies health.SpeedValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "HeartRateValue", schema: health.heartRateValueSchema,
    full: {"value":1,"unit":"beats_per_minute"} satisfies health.HeartRateValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "BloodPressureValue", schema: health.bloodPressureValueSchema,
    full: {"systolic":1,"diastolic":1,"unit":"millimeters_of_mercury"} satisfies health.BloodPressureValue,
    required: ["systolic","diastolic","unit"], optional: [], update: false,
  },
  {
    name: "TemperatureValue", schema: health.temperatureValueSchema,
    full: {"value":"1.2500","unit":"celsius"} satisfies health.TemperatureValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "EnergyValue", schema: health.energyValueSchema,
    full: {"value":"1.2500","unit":"kilocalorie"} satisfies health.EnergyValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "HydrationVolumeValue", schema: health.hydrationVolumeValueSchema,
    full: {"value":"1.2500","unit":"milliliter"} satisfies health.HydrationVolumeValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "NutritionMassValue", schema: health.nutritionMassValueSchema,
    full: {"value":"1.2500","unit":"milligram"} satisfies health.NutritionMassValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "BloodGlucoseValue", schema: health.bloodGlucoseValueSchema,
    full: {"value":"1.2500","unit":"milligrams_per_deciliter"} satisfies health.BloodGlucoseValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "OxygenSaturationValue", schema: health.oxygenSaturationValueSchema,
    full: {"value":"1.2500","unit":"percent"} satisfies health.OxygenSaturationValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "PercentageValue", schema: health.percentageValueSchema,
    full: {"value":"1.2500","unit":"percent"} satisfies health.PercentageValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "RepetitionCount", schema: health.repetitionCountSchema,
    full: {"value":1,"unit":"repetition"} satisfies health.RepetitionCount,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "WorkoutLoadValue", schema: health.workoutLoadValueSchema,
    full: {"value":"1.2500","unit":"kilogram_repetition"} satisfies health.WorkoutLoadValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "HeartRateVariabilityValue", schema: health.heartRateVariabilityValueSchema,
    full: {"value":"1.2500","unit":"millisecond"} satisfies health.HeartRateVariabilityValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "HealthDomainError", schema: health.healthDomainErrorSchema,
    full: {"code":"not_found","message":"Synthetic message","details":{"reference":"synthetic"}} satisfies health.HealthDomainError,
    required: ["code","message"], optional: ["details"], update: false,
  },
  {
    name: "EntityMetadata", schema: health.entityMetadataSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.EntityMetadata,
    required: ["ownerId","createdAt","updatedAt"], optional: [], update: false,
  },
  {
    name: "DateRange", schema: health.dateRangeSchema,
    full: {"startsAt":"2040-02-29T12:00:00.123456789Z","endsAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.DateRange,
    required: ["startsAt","endsAt"], optional: [], update: false,
  },
  {
    name: "PageRequest", schema: health.pageRequestSchema,
    full: {"cursor":"Synthetic observation","limit":1} satisfies health.PageRequest,
    required: [], optional: ["cursor","limit"], update: false,
  },
  {
    name: "OwnerQuery", schema: health.ownerQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1"} satisfies health.OwnerQuery,
    required: ["ownerId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "CreateAppointmentInput", schema: health.createAppointmentInputSchema,
    full: {"ownerId":"synthetic-id-1","title":"Synthetic observation","startsAt":"2040-02-29T12:00:00.123456789Z","endsAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.CreateAppointmentInput,
    required: ["ownerId","title","startsAt"], optional: ["endsAt"], update: false,
  },
  {
    name: "UpdateAppointmentInput", schema: health.updateAppointmentInputSchema,
    full: {"title":"Synthetic observation","status":"scheduled","startsAt":"2040-02-29T12:00:00.123456789Z","endsAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.UpdateAppointmentInput,
    required: [], optional: ["title","status","startsAt","endsAt"], update: true,
  },
  {
    name: "AppointmentListQuery", schema: health.appointmentListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","status":"scheduled"} satisfies health.AppointmentListQuery,
    required: ["ownerId"], optional: ["cursor","limit","status"], update: false,
  },
  {
    name: "UpcomingAppointmentsQuery", schema: health.upcomingAppointmentsQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","startsBefore":"2040-02-29T12:00:00.123456789Z"} satisfies health.UpcomingAppointmentsQuery,
    required: ["ownerId"], optional: ["cursor","limit","startsBefore"], update: false,
  },
  {
    name: "Appointment", schema: health.appointmentSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","title":"Synthetic observation","status":"scheduled","startsAt":"2040-02-29T12:00:00.123456789Z","endsAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.Appointment,
    required: ["ownerId","createdAt","updatedAt","id","title","status","startsAt"], optional: ["endsAt"], update: false,
  },
  {
    name: "RecordBodyCompositionInput", schema: health.recordBodyCompositionInputSchema,
    full: {"ownerId":"synthetic-id-1","observedAt":"2040-02-29T12:00:00.123456789Z","weight":{"value":"1.2500","unit":"kilogram"},"height":{"value":"1.2500","unit":"centimeter"},"bodyFat":{"value":"1.2500","unit":"percent"},"waist":{"value":"1.2500","unit":"meter"},"hip":{"value":"1.2500","unit":"meter"},"muscleMass":{"value":"1.2500","unit":"kilogram"}} satisfies health.RecordBodyCompositionInput,
    required: ["ownerId","observedAt"], optional: ["weight","height","bodyFat","waist","hip","muscleMass"], update: false,
  },
  {
    name: "UpdateBodyCompositionInput", schema: health.updateBodyCompositionInputSchema,
    full: {"observedAt":"2040-02-29T12:00:00.123456789Z","weight":{"value":"1.2500","unit":"kilogram"},"height":{"value":"1.2500","unit":"centimeter"},"bodyFat":{"value":"1.2500","unit":"percent"},"waist":{"value":"1.2500","unit":"meter"},"hip":{"value":"1.2500","unit":"meter"},"muscleMass":{"value":"1.2500","unit":"kilogram"}} satisfies health.UpdateBodyCompositionInput,
    required: ["observedAt"], optional: ["weight","height","bodyFat","waist","hip","muscleMass"], update: true,
  },
  {
    name: "BodyCompositionListQuery", schema: health.bodyCompositionListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1"} satisfies health.BodyCompositionListQuery,
    required: ["ownerId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "BodyCompositionRecord", schema: health.bodyCompositionRecordSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","observedAt":"2040-02-29T12:00:00.123456789Z","weight":{"value":"1.2500","unit":"kilogram"},"height":{"value":"1.2500","unit":"centimeter"},"bodyFat":{"value":"1.2500","unit":"percent"},"waist":{"value":"1.2500","unit":"meter"},"hip":{"value":"1.2500","unit":"meter"},"muscleMass":{"value":"1.2500","unit":"kilogram"}} satisfies health.BodyCompositionRecord,
    required: ["ownerId","createdAt","updatedAt","id","observedAt"], optional: ["weight","height","bodyFat","waist","hip","muscleMass"], update: false,
  },
  {
    name: "CreateEquipmentInput", schema: health.createEquipmentInputSchema,
    full: {"ownerId":"synthetic-id-1","name":"Synthetic observation","category":"running_shoes","acquiredOn":"2040-02-29"} satisfies health.CreateEquipmentInput,
    required: ["ownerId","name","category"], optional: ["acquiredOn"], update: false,
  },
  {
    name: "UpdateEquipmentInput", schema: health.updateEquipmentInputSchema,
    full: {"name":"Synthetic observation","category":"running_shoes","status":"active","acquiredOn":"2040-02-29"} satisfies health.UpdateEquipmentInput,
    required: [], optional: ["name","category","status","acquiredOn"], update: true,
  },
  {
    name: "EquipmentListQuery", schema: health.equipmentListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","category":"running_shoes","status":"active"} satisfies health.EquipmentListQuery,
    required: ["ownerId"], optional: ["cursor","limit","category","status"], update: false,
  },
  {
    name: "RecordEquipmentUsageInput", schema: health.recordEquipmentUsageInputSchema,
    full: {"equipmentId":"synthetic-id-1","ownerId":"synthetic-id-1","workoutSessionId":"synthetic-id-1","runningActivityId":"synthetic-id-1","distance":{"value":"1.2500","unit":"meter"},"duration":{"value":"1.2500","unit":"second"}} satisfies health.RecordEquipmentUsageInput,
    required: ["equipmentId","ownerId"], optional: ["workoutSessionId","runningActivityId","distance","duration"], update: false,
  },
  {
    name: "Equipment", schema: health.equipmentSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","name":"Synthetic observation","category":"running_shoes","status":"active","acquiredOn":"2040-02-29"} satisfies health.Equipment,
    required: ["ownerId","createdAt","updatedAt","id","name","category","status"], optional: ["acquiredOn"], update: false,
  },
  {
    name: "EquipmentUsageSummary", schema: health.equipmentUsageSummarySchema,
    full: {"equipmentId":"synthetic-id-1","totalDistance":{"value":"1.2500","unit":"meter"},"totalDuration":{"value":"1.2500","unit":"second"},"useCount":1} satisfies health.EquipmentUsageSummary,
    required: ["equipmentId","useCount"], optional: ["totalDistance","totalDuration"], update: false,
  },
  {
    name: "RecordExerciseSetInput", schema: health.recordExerciseSetInputSchema,
    full: {"ownerId":"synthetic-id-1","workoutSessionId":"synthetic-id-1","exerciseId":"synthetic-id-1","sequence":1,"repetitions":{"value":1,"unit":"repetition"},"weight":{"value":"1.2500","unit":"kilogram"},"duration":{"value":"1.2500","unit":"second"},"distance":{"value":"1.2500","unit":"meter"},"perceivedEffort":{"value":1,"scale":"one_to_ten"}} satisfies health.RecordExerciseSetInput,
    required: ["ownerId","workoutSessionId","exerciseId","sequence"], optional: ["repetitions","weight","duration","distance","perceivedEffort"], update: false,
  },
  {
    name: "UpdateExerciseSetInput", schema: health.updateExerciseSetInputSchema,
    full: {"sequence":1,"repetitions":{"value":1,"unit":"repetition"},"weight":{"value":"1.2500","unit":"kilogram"},"duration":{"value":"1.2500","unit":"second"},"distance":{"value":"1.2500","unit":"meter"},"perceivedEffort":{"value":1,"scale":"one_to_ten"}} satisfies health.UpdateExerciseSetInput,
    required: [], optional: ["sequence","repetitions","weight","duration","distance","perceivedEffort"], update: true,
  },
  {
    name: "ExerciseSetListQuery", schema: health.exerciseSetListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","workoutSessionId":"synthetic-id-1","exerciseId":"synthetic-id-1"} satisfies health.ExerciseSetListQuery,
    required: ["ownerId"], optional: ["cursor","limit","workoutSessionId","exerciseId"], update: false,
  },
  {
    name: "ExerciseSetsByWorkoutQuery", schema: health.exerciseSetsByWorkoutQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","workoutSessionId":"synthetic-id-1"} satisfies health.ExerciseSetsByWorkoutQuery,
    required: ["ownerId","workoutSessionId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "ExerciseSetsByExerciseQuery", schema: health.exerciseSetsByExerciseQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","exerciseId":"synthetic-id-1"} satisfies health.ExerciseSetsByExerciseQuery,
    required: ["ownerId","exerciseId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "PerceivedEffort", schema: health.perceivedEffortSchema,
    full: {"value":1,"scale":"one_to_ten"} satisfies health.PerceivedEffort,
    required: ["value","scale"], optional: [], update: false,
  },
  {
    name: "ExerciseSet", schema: health.exerciseSetSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","workoutSessionId":"synthetic-id-1","exerciseId":"synthetic-id-1","sequence":1,"repetitions":{"value":1,"unit":"repetition"},"weight":{"value":"1.2500","unit":"kilogram"},"duration":{"value":"1.2500","unit":"second"},"distance":{"value":"1.2500","unit":"meter"},"perceivedEffort":{"value":1,"scale":"one_to_ten"}} satisfies health.ExerciseSet,
    required: ["ownerId","createdAt","updatedAt","id","workoutSessionId","exerciseId","sequence"], optional: ["repetitions","weight","duration","distance","perceivedEffort"], update: false,
  },
  {
    name: "CreateExerciseInput", schema: health.createExerciseInputSchema,
    full: {"ownerId":"synthetic-id-1","name":"Synthetic observation","category":"strength"} satisfies health.CreateExerciseInput,
    required: ["ownerId","name","category"], optional: [], update: false,
  },
  {
    name: "UpdateExerciseInput", schema: health.updateExerciseInputSchema,
    full: {"name":"Synthetic observation","category":"strength","status":"active"} satisfies health.UpdateExerciseInput,
    required: [], optional: ["name","category","status"], update: true,
  },
  {
    name: "ExerciseListQuery", schema: health.exerciseListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","category":"strength","status":"active"} satisfies health.ExerciseListQuery,
    required: ["ownerId"], optional: ["cursor","limit","category","status"], update: false,
  },
  {
    name: "ExercisesByCategoryQuery", schema: health.exercisesByCategoryQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","category":"strength"} satisfies health.ExercisesByCategoryQuery,
    required: ["ownerId","category"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "Exercise", schema: health.exerciseSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","name":"Synthetic observation","category":"strength","status":"active"} satisfies health.Exercise,
    required: ["ownerId","createdAt","updatedAt","id","name","category","status"], optional: [], update: false,
  },
  {
    name: "RecordHydrationInput", schema: health.recordHydrationInputSchema,
    full: {"ownerId":"synthetic-id-1","volume":{"value":"1.2500","unit":"milliliter"},"consumedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.RecordHydrationInput,
    required: ["ownerId","volume","consumedAt"], optional: [], update: false,
  },
  {
    name: "UpdateHydrationEntryInput", schema: health.updateHydrationEntryInputSchema,
    full: {"volume":{"value":"1.2500","unit":"milliliter"},"consumedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.UpdateHydrationEntryInput,
    required: [], optional: ["volume","consumedAt"], update: true,
  },
  {
    name: "HydrationEntryListQuery", schema: health.hydrationEntryListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1"} satisfies health.HydrationEntryListQuery,
    required: ["ownerId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "HydrationEntriesByDateQuery", schema: health.hydrationEntriesByDateQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","date":"2040-02-29"} satisfies health.HydrationEntriesByDateQuery,
    required: ["ownerId","date"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "HydrationEntry", schema: health.hydrationEntrySchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","volume":{"value":"1.2500","unit":"milliliter"},"consumedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.HydrationEntry,
    required: ["ownerId","createdAt","updatedAt","id","volume","consumedAt"], optional: [], update: false,
  },
  {
    name: "RecordLaboratoryResultInput", schema: health.recordLaboratoryResultInputSchema,
    full: {"ownerId":"synthetic-id-1","testName":"Synthetic observation","result":{"kind":"numeric","value":"1.2500","unit":"Synthetic observation"},"collectedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.RecordLaboratoryResultInput,
    required: ["ownerId","testName","result","collectedAt"], optional: [], update: false,
  },
  {
    name: "UpdateLaboratoryResultInput", schema: health.updateLaboratoryResultInputSchema,
    full: {"testName":"Synthetic observation","result":{"kind":"numeric","value":"1.2500","unit":"Synthetic observation"},"collectedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.UpdateLaboratoryResultInput,
    required: [], optional: ["testName","result","collectedAt"], update: true,
  },
  {
    name: "LaboratoryResultListQuery", schema: health.laboratoryResultListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1"} satisfies health.LaboratoryResultListQuery,
    required: ["ownerId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "LaboratoryResultValue", schema: health.laboratoryResultValueSchema,
    full: {"kind":"numeric","value":"1.2500","unit":"Synthetic observation"} satisfies health.LaboratoryResultValue,
    required: ["kind","value","unit"], optional: [], update: false,
  },
  {
    name: "LaboratoryResult", schema: health.laboratoryResultSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","testName":"Synthetic observation","result":{"kind":"numeric","value":"1.2500","unit":"Synthetic observation"},"collectedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.LaboratoryResult,
    required: ["ownerId","createdAt","updatedAt","id","testName","result","collectedAt"], optional: [], update: false,
  },
  {
    name: "RecordHealthMeasurementInput", schema: health.recordHealthMeasurementInputSchema,
    full: {"ownerId":"synthetic-id-1","type":"weight","measurement":{"value":"1.2500","unit":"kilogram"},"observedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.RecordHealthMeasurementInput,
    required: ["ownerId","type","measurement","observedAt"], optional: [], update: false,
  },
  {
    name: "UpdateHealthMeasurementInput", schema: health.updateHealthMeasurementInputSchema,
    full: {"measurement":{"value":"1.2500","unit":"kilogram"},"observedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.UpdateHealthMeasurementInput,
    required: [], optional: ["measurement","observedAt"], update: true,
  },
  {
    name: "HealthMeasurementListQuery", schema: health.healthMeasurementListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","type":"weight"} satisfies health.HealthMeasurementListQuery,
    required: ["ownerId"], optional: ["cursor","limit","type"], update: false,
  },
  {
    name: "HealthMeasurementsByTypeQuery", schema: health.healthMeasurementsByTypeQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","type":"weight"} satisfies health.HealthMeasurementsByTypeQuery,
    required: ["ownerId","type"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "HealthMeasurementsByDateRangeQuery", schema: health.healthMeasurementsByDateRangeQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","range":{"startsAt":"2040-02-29T12:00:00.123456789Z","endsAt":"2040-02-29T12:00:00.123456789Z"}} satisfies health.HealthMeasurementsByDateRangeQuery,
    required: ["ownerId","range"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "HealthMeasurementValue", schema: health.healthMeasurementValueSchema,
    full: {"value":"1.2500","unit":"kilogram"} satisfies health.HealthMeasurementValue,
    required: ["value","unit"], optional: [], update: false,
  },
  {
    name: "HealthMeasurement", schema: health.healthMeasurementSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","type":"weight","measurement":{"value":"1.2500","unit":"kilogram"},"observedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.HealthMeasurement,
    required: ["ownerId","createdAt","updatedAt","id","type","measurement","observedAt"], optional: [], update: false,
  },
  {
    name: "MedicationLog", schema: health.medicationLogSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","medicationId":"synthetic-id-1","status":"taken","scheduledAt":"2040-02-29T12:00:00.123456789Z","recordedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.MedicationLog,
    required: ["ownerId","createdAt","updatedAt","id","medicationId","status","recordedAt"], optional: ["scheduledAt"], update: false,
  },
  {
    name: "CreateMedicationInput", schema: health.createMedicationInputSchema,
    full: {"ownerId":"synthetic-id-1","name":"Synthetic observation","startedOn":"2040-02-29","endedOn":"2040-02-29"} satisfies health.CreateMedicationInput,
    required: ["ownerId","name"], optional: ["startedOn","endedOn"], update: false,
  },
  {
    name: "UpdateMedicationInput", schema: health.updateMedicationInputSchema,
    full: {"name":"Synthetic observation","status":"active","startedOn":"2040-02-29","endedOn":"2040-02-29"} satisfies health.UpdateMedicationInput,
    required: [], optional: ["name","status","startedOn","endedOn"], update: true,
  },
  {
    name: "MedicationListQuery", schema: health.medicationListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","status":"active"} satisfies health.MedicationListQuery,
    required: ["ownerId"], optional: ["cursor","limit","status"], update: false,
  },
  {
    name: "RecordMedicationLogInput", schema: health.recordMedicationLogInputSchema,
    full: {"ownerId":"synthetic-id-1","medicationId":"synthetic-id-1","scheduledAt":"2040-02-29T12:00:00.123456789Z","recordedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.RecordMedicationLogInput,
    required: ["ownerId","medicationId","recordedAt"], optional: ["scheduledAt"], update: false,
  },
  {
    name: "UpdateMedicationLogInput", schema: health.updateMedicationLogInputSchema,
    full: {"scheduledAt":"2040-02-29T12:00:00.123456789Z","recordedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.UpdateMedicationLogInput,
    required: [], optional: ["scheduledAt","recordedAt"], update: true,
  },
  {
    name: "MedicationLogListQuery", schema: health.medicationLogListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","medicationId":"synthetic-id-1"} satisfies health.MedicationLogListQuery,
    required: ["ownerId"], optional: ["cursor","limit","medicationId"], update: false,
  },
  {
    name: "Medication", schema: health.medicationSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","name":"Synthetic observation","status":"active","startedOn":"2040-02-29","endedOn":"2040-02-29"} satisfies health.Medication,
    required: ["ownerId","createdAt","updatedAt","id","name","status"], optional: ["startedOn","endedOn"], update: false,
  },
  {
    name: "CreateNutritionEntryInput", schema: health.createNutritionEntryInputSchema,
    full: {"ownerId":"synthetic-id-1","title":"Synthetic observation","mealType":"breakfast","consumedAt":"2040-02-29T12:00:00.123456789Z","energy":{"value":"1.2500","unit":"kilocalorie"},"protein":{"value":"1.2500","unit":"milligram"},"carbohydrate":{"value":"1.2500","unit":"milligram"},"fat":{"value":"1.2500","unit":"milligram"}} satisfies health.CreateNutritionEntryInput,
    required: ["ownerId","title","mealType","consumedAt"], optional: ["energy","protein","carbohydrate","fat"], update: false,
  },
  {
    name: "UpdateNutritionEntryInput", schema: health.updateNutritionEntryInputSchema,
    full: {"title":"Synthetic observation","mealType":"breakfast","consumedAt":"2040-02-29T12:00:00.123456789Z","energy":{"value":"1.2500","unit":"kilocalorie"},"protein":{"value":"1.2500","unit":"milligram"},"carbohydrate":{"value":"1.2500","unit":"milligram"},"fat":{"value":"1.2500","unit":"milligram"}} satisfies health.UpdateNutritionEntryInput,
    required: [], optional: ["title","mealType","consumedAt","energy","protein","carbohydrate","fat"], update: true,
  },
  {
    name: "NutritionEntryListQuery", schema: health.nutritionEntryListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1"} satisfies health.NutritionEntryListQuery,
    required: ["ownerId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "NutritionEntriesByDateQuery", schema: health.nutritionEntriesByDateQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","date":"2040-02-29"} satisfies health.NutritionEntriesByDateQuery,
    required: ["ownerId","date"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "NutritionEntry", schema: health.nutritionEntrySchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","title":"Synthetic observation","mealType":"breakfast","consumedAt":"2040-02-29T12:00:00.123456789Z","energy":{"value":"1.2500","unit":"kilocalorie"},"protein":{"value":"1.2500","unit":"milligram"},"carbohydrate":{"value":"1.2500","unit":"milligram"},"fat":{"value":"1.2500","unit":"milligram"}} satisfies health.NutritionEntry,
    required: ["ownerId","createdAt","updatedAt","id","title","mealType","consumedAt"], optional: ["energy","protein","carbohydrate","fat"], update: false,
  },
  {
    name: "RecordPersonalRecordInput", schema: health.recordPersonalRecordInputSchema,
    full: {"ownerId":"synthetic-id-1","exerciseId":"synthetic-id-1","runningActivityId":"synthetic-id-1","title":"Synthetic observation","metric":{"type":"distance","value":{"value":"1.2500","unit":"meter"}},"achievedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.RecordPersonalRecordInput,
    required: ["ownerId","title","metric","achievedAt"], optional: ["exerciseId","runningActivityId"], update: false,
  },
  {
    name: "UpdatePersonalRecordInput", schema: health.updatePersonalRecordInputSchema,
    full: {"title":"Synthetic observation","metric":{"type":"distance","value":{"value":"1.2500","unit":"meter"}},"achievedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.UpdatePersonalRecordInput,
    required: [], optional: ["title","metric","achievedAt"], update: true,
  },
  {
    name: "PersonalRecordListQuery", schema: health.personalRecordListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","exerciseId":"synthetic-id-1"} satisfies health.PersonalRecordListQuery,
    required: ["ownerId"], optional: ["cursor","limit","exerciseId"], update: false,
  },
  {
    name: "PersonalRecordMetric", schema: health.personalRecordMetricSchema,
    full: {"type":"distance","value":{"value":"1.2500","unit":"meter"}} satisfies health.PersonalRecordMetric,
    required: ["type","value"], optional: [], update: false,
  },
  {
    name: "PersonalRecord", schema: health.personalRecordSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","exerciseId":"synthetic-id-1","runningActivityId":"synthetic-id-1","title":"Synthetic observation","metric":{"type":"distance","value":{"value":"1.2500","unit":"meter"}},"achievedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.PersonalRecord,
    required: ["ownerId","createdAt","updatedAt","id","title","metric","achievedAt"], optional: ["exerciseId","runningActivityId"], update: false,
  },
  {
    name: "CreateHealthProfileInput", schema: health.createHealthProfileInputSchema,
    full: {"ownerId":"synthetic-id-1","measurementSystem":"metric","birthDate":"2040-02-29"} satisfies health.CreateHealthProfileInput,
    required: ["ownerId","measurementSystem"], optional: ["birthDate"], update: false,
  },
  {
    name: "UpdateHealthProfileInput", schema: health.updateHealthProfileInputSchema,
    full: {"measurementSystem":"metric","birthDate":"2040-02-29","status":"active"} satisfies health.UpdateHealthProfileInput,
    required: [], optional: ["measurementSystem","birthDate","status"], update: true,
  },
  {
    name: "HealthProfile", schema: health.healthProfileSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","measurementSystem":"metric","birthDate":"2040-02-29","status":"active"} satisfies health.HealthProfile,
    required: ["ownerId","createdAt","updatedAt","id","measurementSystem","status"], optional: ["birthDate"], update: false,
  },
  {
    name: "RecordRecoveryEntryInput", schema: health.recordRecoveryEntryInputSchema,
    full: {"ownerId":"synthetic-id-1","observedAt":"2040-02-29T12:00:00.123456789Z","energy":{"value":1,"scale":"one_to_ten"},"soreness":{"value":1,"scale":"one_to_ten"},"fatigue":{"value":1,"scale":"one_to_ten"},"mood":{"value":1,"scale":"one_to_ten"},"restingHeartRate":{"value":1,"unit":"beats_per_minute"},"heartRateVariability":{"value":"1.2500","unit":"millisecond"}} satisfies health.RecordRecoveryEntryInput,
    required: ["ownerId","observedAt"], optional: ["energy","soreness","fatigue","mood","restingHeartRate","heartRateVariability"], update: false,
  },
  {
    name: "UpdateRecoveryEntryInput", schema: health.updateRecoveryEntryInputSchema,
    full: {"observedAt":"2040-02-29T12:00:00.123456789Z","energy":{"value":1,"scale":"one_to_ten"},"soreness":{"value":1,"scale":"one_to_ten"},"fatigue":{"value":1,"scale":"one_to_ten"},"mood":{"value":1,"scale":"one_to_ten"},"restingHeartRate":{"value":1,"unit":"beats_per_minute"},"heartRateVariability":{"value":"1.2500","unit":"millisecond"}} satisfies health.UpdateRecoveryEntryInput,
    required: [], optional: ["observedAt","energy","soreness","fatigue","mood","restingHeartRate","heartRateVariability"], update: true,
  },
  {
    name: "RecoveryEntryListQuery", schema: health.recoveryEntryListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1"} satisfies health.RecoveryEntryListQuery,
    required: ["ownerId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "RecoveryRating", schema: health.recoveryRatingSchema,
    full: {"value":1,"scale":"one_to_ten"} satisfies health.RecoveryRating,
    required: ["value","scale"], optional: [], update: false,
  },
  {
    name: "RecoveryEntry", schema: health.recoveryEntrySchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","observedAt":"2040-02-29T12:00:00.123456789Z","energy":{"value":1,"scale":"one_to_ten"},"soreness":{"value":1,"scale":"one_to_ten"},"fatigue":{"value":1,"scale":"one_to_ten"},"mood":{"value":1,"scale":"one_to_ten"},"restingHeartRate":{"value":1,"unit":"beats_per_minute"},"heartRateVariability":{"value":"1.2500","unit":"millisecond"}} satisfies health.RecoveryEntry,
    required: ["ownerId","createdAt","updatedAt","id","observedAt"], optional: ["energy","soreness","fatigue","mood","restingHeartRate","heartRateVariability"], update: false,
  },
  {
    name: "RepositoryFilter", schema: health.repositoryFilterSchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1"} satisfies health.RepositoryFilter,
    required: ["ownerId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "CreateActivityRouteInput", schema: health.createActivityRouteInputSchema,
    full: {"ownerId":"synthetic-id-1","title":"Synthetic observation","distance":{"value":"1.2500","unit":"meter"}} satisfies health.CreateActivityRouteInput,
    required: ["ownerId","title"], optional: ["distance"], update: false,
  },
  {
    name: "UpdateActivityRouteInput", schema: health.updateActivityRouteInputSchema,
    full: {"title":"Synthetic observation","distance":{"value":"1.2500","unit":"meter"}} satisfies health.UpdateActivityRouteInput,
    required: [], optional: ["title","distance"], update: true,
  },
  {
    name: "ActivityRouteListQuery", schema: health.activityRouteListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1"} satisfies health.ActivityRouteListQuery,
    required: ["ownerId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "ActivityRoute", schema: health.activityRouteSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","title":"Synthetic observation","distance":{"value":"1.2500","unit":"meter"}} satisfies health.ActivityRoute,
    required: ["ownerId","createdAt","updatedAt","id","title"], optional: ["distance"], update: false,
  },
  {
    name: "CreateRunningActivityInput", schema: health.createRunningActivityInputSchema,
    full: {"ownerId":"synthetic-id-1","workoutSessionId":"synthetic-id-1","routeId":"synthetic-id-1","equipmentIds":["synthetic-id-1"],"title":"Synthetic observation","startedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.CreateRunningActivityInput,
    required: ["ownerId","title","startedAt"], optional: ["workoutSessionId","routeId","equipmentIds"], update: false,
  },
  {
    name: "UpdateRunningActivityInput", schema: health.updateRunningActivityInputSchema,
    full: {"routeId":"synthetic-id-1","equipmentIds":["synthetic-id-1"],"title":"Synthetic observation","startedAt":"2040-02-29T12:00:00.123456789Z","endedAt":"2040-02-29T12:00:00.123456789Z","distance":{"value":"1.2500","unit":"meter"},"duration":{"value":"1.2500","unit":"second"}} satisfies health.UpdateRunningActivityInput,
    required: [], optional: ["routeId","equipmentIds","title","startedAt","endedAt","distance","duration"], update: true,
  },
  {
    name: "RunningActivityListQuery", schema: health.runningActivityListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1"} satisfies health.RunningActivityListQuery,
    required: ["ownerId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "RunningActivitiesByDateRangeQuery", schema: health.runningActivitiesByDateRangeQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","range":{"startsAt":"2040-02-29T12:00:00.123456789Z","endsAt":"2040-02-29T12:00:00.123456789Z"}} satisfies health.RunningActivitiesByDateRangeQuery,
    required: ["ownerId","range"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "RunningActivity", schema: health.runningActivitySchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","workoutSessionId":"synthetic-id-1","routeId":"synthetic-id-1","equipmentIds":["synthetic-id-1"],"title":"Synthetic observation","status":"planned","startedAt":"2040-02-29T12:00:00.123456789Z","endedAt":"2040-02-29T12:00:00.123456789Z","distance":{"value":"1.2500","unit":"meter"},"duration":{"value":"1.2500","unit":"second"}} satisfies health.RunningActivity,
    required: ["ownerId","createdAt","updatedAt","id","title","status","startedAt"], optional: ["workoutSessionId","routeId","equipmentIds","endedAt","distance","duration"], update: false,
  },
  {
    name: "RecordRunningSplitInput", schema: health.recordRunningSplitInputSchema,
    full: {"ownerId":"synthetic-id-1","runningActivityId":"synthetic-id-1","sequence":1,"distance":{"value":"1.2500","unit":"meter"},"duration":{"value":"1.2500","unit":"second"}} satisfies health.RecordRunningSplitInput,
    required: ["ownerId","runningActivityId","sequence","distance","duration"], optional: [], update: false,
  },
  {
    name: "UpdateRunningSplitInput", schema: health.updateRunningSplitInputSchema,
    full: {"sequence":1,"distance":{"value":"1.2500","unit":"meter"},"duration":{"value":"1.2500","unit":"second"}} satisfies health.UpdateRunningSplitInput,
    required: [], optional: ["sequence","distance","duration"], update: true,
  },
  {
    name: "RunningSplitListQuery", schema: health.runningSplitListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","runningActivityId":"synthetic-id-1"} satisfies health.RunningSplitListQuery,
    required: ["ownerId"], optional: ["cursor","limit","runningActivityId"], update: false,
  },
  {
    name: "RunningSplitsByActivityQuery", schema: health.runningSplitsByActivityQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","runningActivityId":"synthetic-id-1"} satisfies health.RunningSplitsByActivityQuery,
    required: ["ownerId","runningActivityId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "RunningSplit", schema: health.runningSplitSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","runningActivityId":"synthetic-id-1","sequence":1,"distance":{"value":"1.2500","unit":"meter"},"duration":{"value":"1.2500","unit":"second"}} satisfies health.RunningSplit,
    required: ["ownerId","createdAt","updatedAt","id","runningActivityId","sequence","distance","duration"], optional: [], update: false,
  },
  {
    name: "RecordSleepInput", schema: health.recordSleepInputSchema,
    full: {"ownerId":"synthetic-id-1","startedAt":"2040-02-29T12:00:00.123456789Z","endedAt":"2040-02-29T12:00:00.123456789Z","duration":{"value":"1.2500","unit":"second"},"quality":"poor"} satisfies health.RecordSleepInput,
    required: ["ownerId","startedAt","endedAt"], optional: ["duration","quality"], update: false,
  },
  {
    name: "UpdateSleepInput", schema: health.updateSleepInputSchema,
    full: {"startedAt":"2040-02-29T12:00:00.123456789Z","endedAt":"2040-02-29T12:00:00.123456789Z","duration":{"value":"1.2500","unit":"second"},"quality":"poor"} satisfies health.UpdateSleepInput,
    required: [], optional: ["startedAt","endedAt","duration","quality"], update: true,
  },
  {
    name: "SleepRecordListQuery", schema: health.sleepRecordListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1"} satisfies health.SleepRecordListQuery,
    required: ["ownerId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "SleepRecordsByDateRangeQuery", schema: health.sleepRecordsByDateRangeQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","range":{"startsAt":"2040-02-29T12:00:00.123456789Z","endsAt":"2040-02-29T12:00:00.123456789Z"}} satisfies health.SleepRecordsByDateRangeQuery,
    required: ["ownerId","range"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "SleepRecord", schema: health.sleepRecordSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","startedAt":"2040-02-29T12:00:00.123456789Z","endedAt":"2040-02-29T12:00:00.123456789Z","duration":{"value":"1.2500","unit":"second"},"quality":"poor"} satisfies health.SleepRecord,
    required: ["ownerId","createdAt","updatedAt","id","startedAt","endedAt"], optional: ["duration","quality"], update: false,
  },
  {
    name: "RecordSymptomInput", schema: health.recordSymptomInputSchema,
    full: {"ownerId":"synthetic-id-1","observation":"Synthetic observation","severity":{"value":1,"scale":"zero_to_ten"},"observedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.RecordSymptomInput,
    required: ["ownerId","observation","observedAt"], optional: ["severity"], update: false,
  },
  {
    name: "UpdateSymptomEntryInput", schema: health.updateSymptomEntryInputSchema,
    full: {"observation":"Synthetic observation","severity":{"value":1,"scale":"zero_to_ten"},"observedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.UpdateSymptomEntryInput,
    required: [], optional: ["observation","severity","observedAt"], update: true,
  },
  {
    name: "SymptomEntryListQuery", schema: health.symptomEntryListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1"} satisfies health.SymptomEntryListQuery,
    required: ["ownerId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "SymptomSeverity", schema: health.symptomSeveritySchema,
    full: {"value":1,"scale":"zero_to_ten"} satisfies health.SymptomSeverity,
    required: ["value","scale"], optional: [], update: false,
  },
  {
    name: "SymptomEntry", schema: health.symptomEntrySchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","observation":"Synthetic observation","severity":{"value":1,"scale":"zero_to_ten"},"observedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.SymptomEntry,
    required: ["ownerId","createdAt","updatedAt","id","observation","observedAt"], optional: ["severity"], update: false,
  },
  {
    name: "RecordVitalReadingInput", schema: health.recordVitalReadingInputSchema,
    full: {"ownerId":"synthetic-id-1","reading":{"type":"resting_heart_rate","value":{"value":1,"unit":"beats_per_minute"}},"observedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.RecordVitalReadingInput,
    required: ["ownerId","reading","observedAt"], optional: [], update: false,
  },
  {
    name: "UpdateVitalReadingInput", schema: health.updateVitalReadingInputSchema,
    full: {"reading":{"type":"resting_heart_rate","value":{"value":1,"unit":"beats_per_minute"}},"observedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.UpdateVitalReadingInput,
    required: [], optional: ["reading","observedAt"], update: true,
  },
  {
    name: "VitalReadingListQuery", schema: health.vitalReadingListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","type":"resting_heart_rate"} satisfies health.VitalReadingListQuery,
    required: ["ownerId"], optional: ["cursor","limit","type"], update: false,
  },
  {
    name: "VitalReadingsByTypeQuery", schema: health.vitalReadingsByTypeQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","type":"resting_heart_rate"} satisfies health.VitalReadingsByTypeQuery,
    required: ["ownerId","type"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "VitalReadingsByDateRangeQuery", schema: health.vitalReadingsByDateRangeQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","range":{"startsAt":"2040-02-29T12:00:00.123456789Z","endsAt":"2040-02-29T12:00:00.123456789Z"}} satisfies health.VitalReadingsByDateRangeQuery,
    required: ["ownerId","range"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "VitalReadingValue", schema: health.vitalReadingValueSchema,
    full: {"type":"resting_heart_rate","value":{"value":1,"unit":"beats_per_minute"}} satisfies health.VitalReadingValue,
    required: ["type","value"], optional: [], update: false,
  },
  {
    name: "VitalReading", schema: health.vitalReadingSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","reading":{"type":"resting_heart_rate","value":{"value":1,"unit":"beats_per_minute"}},"observedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.VitalReading,
    required: ["ownerId","createdAt","updatedAt","id","reading","observedAt"], optional: [], update: false,
  },
  {
    name: "CreateWorkoutPlanInput", schema: health.createWorkoutPlanInputSchema,
    full: {"ownerId":"synthetic-id-1","title":"Synthetic observation","startsOn":"2040-02-29","endsOn":"2040-02-29"} satisfies health.CreateWorkoutPlanInput,
    required: ["ownerId","title"], optional: ["startsOn","endsOn"], update: false,
  },
  {
    name: "UpdateWorkoutPlanInput", schema: health.updateWorkoutPlanInputSchema,
    full: {"title":"Synthetic observation","status":"draft","startsOn":"2040-02-29","endsOn":"2040-02-29"} satisfies health.UpdateWorkoutPlanInput,
    required: [], optional: ["title","status","startsOn","endsOn"], update: true,
  },
  {
    name: "WorkoutPlanListQuery", schema: health.workoutPlanListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","status":"draft"} satisfies health.WorkoutPlanListQuery,
    required: ["ownerId"], optional: ["cursor","limit","status"], update: false,
  },
  {
    name: "WorkoutPlan", schema: health.workoutPlanSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","title":"Synthetic observation","status":"draft","startsOn":"2040-02-29","endsOn":"2040-02-29"} satisfies health.WorkoutPlan,
    required: ["ownerId","createdAt","updatedAt","id","title","status"], optional: ["startsOn","endsOn"], update: false,
  },
  {
    name: "CreateWorkoutSessionInput", schema: health.createWorkoutSessionInputSchema,
    full: {"ownerId":"synthetic-id-1","workoutPlanId":"synthetic-id-1","title":"Synthetic observation","scheduledAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.CreateWorkoutSessionInput,
    required: ["ownerId","title"], optional: ["workoutPlanId","scheduledAt"], update: false,
  },
  {
    name: "UpdateWorkoutSessionInput", schema: health.updateWorkoutSessionInputSchema,
    full: {"workoutPlanId":"synthetic-id-1","title":"Synthetic observation","scheduledAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.UpdateWorkoutSessionInput,
    required: [], optional: ["workoutPlanId","title","scheduledAt"], update: true,
  },
  {
    name: "WorkoutSessionListQuery", schema: health.workoutSessionListQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1"} satisfies health.WorkoutSessionListQuery,
    required: ["ownerId"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "WorkoutSessionsByDateRangeQuery", schema: health.workoutSessionsByDateRangeQuerySchema,
    full: {"cursor":"Synthetic observation","limit":1,"ownerId":"synthetic-id-1","range":{"startsAt":"2040-02-29T12:00:00.123456789Z","endsAt":"2040-02-29T12:00:00.123456789Z"}} satisfies health.WorkoutSessionsByDateRangeQuery,
    required: ["ownerId","range"], optional: ["cursor","limit"], update: false,
  },
  {
    name: "WorkoutSession", schema: health.workoutSessionSchema,
    full: {"ownerId":"synthetic-id-1","createdAt":"2040-02-29T12:00:00.123456789Z","updatedAt":"2040-02-29T12:00:00.123456789Z","id":"synthetic-id-1","workoutPlanId":"synthetic-id-1","title":"Synthetic observation","status":"planned","scheduledAt":"2040-02-29T12:00:00.123456789Z","startedAt":"2040-02-29T12:00:00.123456789Z","endedAt":"2040-02-29T12:00:00.123456789Z"} satisfies health.WorkoutSession,
    required: ["ownerId","createdAt","updatedAt","id","title","status"], optional: ["workoutPlanId","scheduledAt","startedAt","endedAt"], update: false,
  },
];
