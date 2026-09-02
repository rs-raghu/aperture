import type { DecimalString } from "./health.types.js";

export type WeightUnit = "kilogram" | "pound";
export interface WeightValue {
  readonly value: DecimalString;
  readonly unit: WeightUnit;
}

export type HeightUnit = "centimeter" | "inch";
export interface HeightValue {
  readonly value: DecimalString;
  readonly unit: HeightUnit;
}

export type DistanceUnit = "meter" | "kilometer" | "foot" | "mile";
export interface DistanceValue {
  readonly value: DecimalString;
  readonly unit: DistanceUnit;
}

export type DurationUnit = "second" | "minute" | "hour";
export interface DurationValue {
  readonly value: DecimalString;
  readonly unit: DurationUnit;
}

export type PaceUnit = "seconds_per_kilometer" | "seconds_per_mile";
export interface PaceValue {
  readonly value: DecimalString;
  readonly unit: PaceUnit;
}

export type SpeedUnit = "kilometers_per_hour" | "miles_per_hour" | "meters_per_second";
export interface SpeedValue {
  readonly value: DecimalString;
  readonly unit: SpeedUnit;
}

export interface HeartRateValue {
  readonly value: number;
  readonly unit: "beats_per_minute";
}

export interface BloodPressureValue {
  readonly systolic: number;
  readonly diastolic: number;
  readonly unit: "millimeters_of_mercury";
}

export type TemperatureUnit = "celsius" | "fahrenheit";
export interface TemperatureValue {
  readonly value: DecimalString;
  readonly unit: TemperatureUnit;
}

export type EnergyUnit = "kilocalorie" | "kilojoule";
export interface EnergyValue {
  readonly value: DecimalString;
  readonly unit: EnergyUnit;
}

export type HydrationVolumeUnit = "milliliter" | "liter" | "fluid_ounce";
export interface HydrationVolumeValue {
  readonly value: DecimalString;
  readonly unit: HydrationVolumeUnit;
}

export type NutritionMassUnit = "milligram" | "gram" | "ounce";
export interface NutritionMassValue {
  readonly value: DecimalString;
  readonly unit: NutritionMassUnit;
}

export type BloodGlucoseUnit = "milligrams_per_deciliter" | "millimoles_per_liter";
export interface BloodGlucoseValue {
  readonly value: DecimalString;
  readonly unit: BloodGlucoseUnit;
}

export interface OxygenSaturationValue {
  readonly value: DecimalString;
  readonly unit: "percent";
}

export interface PercentageValue {
  readonly value: DecimalString;
  readonly unit: "percent";
}

export interface RepetitionCount {
  readonly value: number;
  readonly unit: "repetition";
}

export type WorkoutLoadUnit = "kilogram_repetition" | "pound_repetition";
export interface WorkoutLoadValue {
  readonly value: DecimalString;
  readonly unit: WorkoutLoadUnit;
}

export interface HeartRateVariabilityValue {
  readonly value: DecimalString;
  readonly unit: "millisecond";
}
