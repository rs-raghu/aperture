import { z } from "@aperture/validation";
import { decimalStringSchema } from "./health.types.js";
import { countSchema, nonNegativeDecimalSchema, percentageDecimalSchema, positiveDecimalSchema } from "./internal/primitives.js";

export const weightUnitSchema = z.enum(["kilogram", "pound"]);
export type WeightUnit = Readonly<z.infer<typeof weightUnitSchema>>;

export const weightValueSchema = z.strictObject({
  value: nonNegativeDecimalSchema,
  unit: weightUnitSchema,
}).readonly();
export type WeightValue = Readonly<z.infer<typeof weightValueSchema>>;

export const heightUnitSchema = z.enum(["centimeter", "inch"]);
export type HeightUnit = Readonly<z.infer<typeof heightUnitSchema>>;

export const heightValueSchema = z.strictObject({
  value: positiveDecimalSchema,
  unit: heightUnitSchema,
}).readonly();
export type HeightValue = Readonly<z.infer<typeof heightValueSchema>>;

export const distanceUnitSchema = z.enum(["meter", "kilometer", "foot", "mile"]);
export type DistanceUnit = Readonly<z.infer<typeof distanceUnitSchema>>;

export const distanceValueSchema = z.strictObject({
  value: nonNegativeDecimalSchema,
  unit: distanceUnitSchema,
}).readonly();
export type DistanceValue = Readonly<z.infer<typeof distanceValueSchema>>;

export const durationUnitSchema = z.enum(["second", "minute", "hour"]);
export type DurationUnit = Readonly<z.infer<typeof durationUnitSchema>>;

export const durationValueSchema = z.strictObject({
  value: nonNegativeDecimalSchema,
  unit: durationUnitSchema,
}).readonly();
export type DurationValue = Readonly<z.infer<typeof durationValueSchema>>;

export const paceUnitSchema = z.enum(["seconds_per_kilometer", "seconds_per_mile"]);
export type PaceUnit = Readonly<z.infer<typeof paceUnitSchema>>;

export const paceValueSchema = z.strictObject({
  value: positiveDecimalSchema,
  unit: paceUnitSchema,
}).readonly();
export type PaceValue = Readonly<z.infer<typeof paceValueSchema>>;

export const speedUnitSchema = z.enum(["kilometers_per_hour", "miles_per_hour", "meters_per_second"]);
export type SpeedUnit = Readonly<z.infer<typeof speedUnitSchema>>;

export const speedValueSchema = z.strictObject({
  value: nonNegativeDecimalSchema,
  unit: speedUnitSchema,
}).readonly();
export type SpeedValue = Readonly<z.infer<typeof speedValueSchema>>;

export const heartRateUnitSchema = z.literal("beats_per_minute");
export type HeartRateUnit = z.infer<typeof heartRateUnitSchema>;

export const heartRateValueSchema = z.strictObject({
  value: z.number().finite().nonnegative(),
  unit: heartRateUnitSchema,
}).readonly();
export type HeartRateValue = Readonly<z.infer<typeof heartRateValueSchema>>;

export const bloodPressureUnitSchema = z.literal("millimeters_of_mercury");
export type BloodPressureUnit = z.infer<typeof bloodPressureUnitSchema>;

export const bloodPressureValueSchema = z.strictObject({
  systolic: z.number().finite().nonnegative(),
  diastolic: z.number().finite().nonnegative(),
  unit: bloodPressureUnitSchema,
}).readonly();
export type BloodPressureValue = Readonly<z.infer<typeof bloodPressureValueSchema>>;

export const temperatureUnitSchema = z.enum(["celsius", "fahrenheit"]);
export type TemperatureUnit = Readonly<z.infer<typeof temperatureUnitSchema>>;

export const temperatureValueSchema = z.strictObject({
  value: decimalStringSchema,
  unit: temperatureUnitSchema,
}).readonly();
export type TemperatureValue = Readonly<z.infer<typeof temperatureValueSchema>>;

export const energyUnitSchema = z.enum(["kilocalorie", "kilojoule"]);
export type EnergyUnit = Readonly<z.infer<typeof energyUnitSchema>>;

export const energyValueSchema = z.strictObject({
  value: nonNegativeDecimalSchema,
  unit: energyUnitSchema,
}).readonly();
export type EnergyValue = Readonly<z.infer<typeof energyValueSchema>>;

export const hydrationVolumeUnitSchema = z.enum(["milliliter", "liter", "fluid_ounce"]);
export type HydrationVolumeUnit = Readonly<z.infer<typeof hydrationVolumeUnitSchema>>;

export const hydrationVolumeValueSchema = z.strictObject({
  value: nonNegativeDecimalSchema,
  unit: hydrationVolumeUnitSchema,
}).readonly();
export type HydrationVolumeValue = Readonly<z.infer<typeof hydrationVolumeValueSchema>>;

export const nutritionMassUnitSchema = z.enum(["milligram", "gram", "ounce"]);
export type NutritionMassUnit = Readonly<z.infer<typeof nutritionMassUnitSchema>>;

export const nutritionMassValueSchema = z.strictObject({
  value: nonNegativeDecimalSchema,
  unit: nutritionMassUnitSchema,
}).readonly();
export type NutritionMassValue = Readonly<z.infer<typeof nutritionMassValueSchema>>;

export const bloodGlucoseUnitSchema = z.enum(["milligrams_per_deciliter", "millimoles_per_liter"]);
export type BloodGlucoseUnit = Readonly<z.infer<typeof bloodGlucoseUnitSchema>>;

export const bloodGlucoseValueSchema = z.strictObject({
  value: nonNegativeDecimalSchema,
  unit: bloodGlucoseUnitSchema,
}).readonly();
export type BloodGlucoseValue = Readonly<z.infer<typeof bloodGlucoseValueSchema>>;

export const oxygenSaturationUnitSchema = z.literal("percent");
export type OxygenSaturationUnit = z.infer<typeof oxygenSaturationUnitSchema>;

export const oxygenSaturationValueSchema = z.strictObject({
  value: percentageDecimalSchema,
  unit: oxygenSaturationUnitSchema,
}).readonly();
export type OxygenSaturationValue = Readonly<z.infer<typeof oxygenSaturationValueSchema>>;

export const percentageUnitSchema = z.literal("percent");
export type PercentageUnit = z.infer<typeof percentageUnitSchema>;

export const percentageValueSchema = z.strictObject({
  value: percentageDecimalSchema,
  unit: percentageUnitSchema,
}).readonly();
export type PercentageValue = Readonly<z.infer<typeof percentageValueSchema>>;

export const repetitionUnitSchema = z.literal("repetition");
export type RepetitionUnit = z.infer<typeof repetitionUnitSchema>;

export const repetitionCountSchema = z.strictObject({
  value: countSchema,
  unit: repetitionUnitSchema,
}).readonly();
export type RepetitionCount = Readonly<z.infer<typeof repetitionCountSchema>>;

export const workoutLoadUnitSchema = z.enum(["kilogram_repetition", "pound_repetition"]);
export type WorkoutLoadUnit = Readonly<z.infer<typeof workoutLoadUnitSchema>>;

export const workoutLoadValueSchema = z.strictObject({
  value: nonNegativeDecimalSchema,
  unit: workoutLoadUnitSchema,
}).readonly();
export type WorkoutLoadValue = Readonly<z.infer<typeof workoutLoadValueSchema>>;

export const heartRateVariabilityUnitSchema = z.literal("millisecond");
export type HeartRateVariabilityUnit = z.infer<typeof heartRateVariabilityUnitSchema>;

export const heartRateVariabilityValueSchema = z.strictObject({
  value: nonNegativeDecimalSchema,
  unit: heartRateVariabilityUnitSchema,
}).readonly();
export type HeartRateVariabilityValue = Readonly<z.infer<typeof heartRateVariabilityValueSchema>>;
