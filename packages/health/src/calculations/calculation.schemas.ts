import { z } from "@aperture/validation";

import {
  distanceUnitSchema,
  distanceValueSchema,
  durationUnitSchema,
  durationValueSchema,
  energyValueSchema,
  heartRateValueSchema,
  heartRateVariabilityValueSchema,
  heightValueSchema,
  hydrationVolumeUnitSchema,
  hydrationVolumeValueSchema,
  paceUnitSchema,
  paceValueSchema,
  percentageValueSchema,
  repetitionCountSchema,
  weightValueSchema,
  workoutLoadValueSchema,
} from "../health-units.types.js";
import { decimalStringSchema } from "../health.types.js";
import { recoveryRatingSchema } from "../recovery/recovery-entry.types.js";

const estimateSchema = z.literal(true);
const exactSchema = z.literal(false);

export const bmiInputSchema = z.strictObject({
  weight: weightValueSchema,
  height: heightValueSchema,
}).readonly();
export const bmiResultSchema = z.strictObject({
  value: decimalStringSchema,
  unit: z.literal("kilograms_per_square_meter"),
  isEstimate: exactSchema,
}).readonly();

export const bmrSexInputSchema = z.enum(["female", "male", "unspecified"]);
export const ageValueSchema = z.strictObject({
  value: z.number().finite().int().min(0).max(130),
  unit: z.literal("year"),
}).readonly();
export const bmrInputSchema = z.strictObject({
  weight: weightValueSchema,
  height: heightValueSchema,
  age: ageValueSchema,
  sex: bmrSexInputSchema,
}).readonly();
export const bmrResultSchema = z.strictObject({
  energy: energyValueSchema,
  period: z.literal("day"),
  isEstimate: estimateSchema,
}).readonly();

export const heartRateZonesInputSchema = z.strictObject({
  restingHeartRate: heartRateValueSchema.optional(),
  maximumHeartRate: heartRateValueSchema,
  zoneBoundaries: z.array(percentageValueSchema).min(2).readonly(),
}).readonly();
export const heartRateZoneResultSchema = z.strictObject({
  zone: z.string().regex(/^zone_[1-9]\d*$/),
  lowerBound: heartRateValueSchema,
  upperBound: heartRateValueSchema,
}).readonly();
export const heartRateZonesResultSchema = z.strictObject({
  zones: z.array(heartRateZoneResultSchema).readonly(),
  isEstimate: estimateSchema,
}).readonly();

export const hydrationSummaryInputSchema = z.strictObject({
  volumes: z.array(hydrationVolumeValueSchema).readonly(),
  outputUnit: hydrationVolumeUnitSchema,
}).readonly();
export const hydrationSummaryResultSchema = z.strictObject({
  entryCount: z.number().finite().int().nonnegative(),
  totalVolume: hydrationVolumeValueSchema,
  isEstimate: exactSchema,
}).readonly();

export const oneRepMaxInputSchema = z.strictObject({
  weight: weightValueSchema,
  repetitions: repetitionCountSchema,
}).readonly();
export const oneRepMaxResultSchema = z.strictObject({
  estimatedWeight: weightValueSchema,
  isEstimate: estimateSchema,
}).readonly();

export const recoverySummaryEntryInputSchema = z.strictObject({
  energy: recoveryRatingSchema.optional(),
  soreness: recoveryRatingSchema.optional(),
  fatigue: recoveryRatingSchema.optional(),
  mood: recoveryRatingSchema.optional(),
  restingHeartRate: heartRateValueSchema.optional(),
  heartRateVariability: heartRateVariabilityValueSchema.optional(),
}).readonly();
export const recoverySummaryInputSchema = z.strictObject({
  entries: z.array(recoverySummaryEntryInputSchema).readonly(),
}).readonly();
export const recoverySummaryResultSchema = z.strictObject({
  entryCount: z.number().finite().int().nonnegative(),
  averageEnergy: decimalStringSchema.optional(),
  averageSoreness: decimalStringSchema.optional(),
  averageFatigue: decimalStringSchema.optional(),
  averageMood: decimalStringSchema.optional(),
  ratingScale: z.literal("one_to_ten"),
  isEstimate: estimateSchema,
}).readonly();

export const runningPaceInputSchema = z.strictObject({
  distance: distanceValueSchema,
  duration: durationValueSchema,
  outputUnit: paceUnitSchema,
}).readonly();
export const runningPaceResultSchema = z.strictObject({
  pace: paceValueSchema,
  isEstimate: exactSchema,
}).readonly();

export const runningSummaryActivityInputSchema = z.strictObject({
  distance: distanceValueSchema,
  duration: durationValueSchema,
}).readonly();
export const runningSummaryInputSchema = z.strictObject({
  activities: z.array(runningSummaryActivityInputSchema).readonly(),
  outputDistanceUnit: distanceUnitSchema,
}).readonly();
export const runningSummaryResultSchema = z.strictObject({
  activityCount: z.number().finite().int().nonnegative(),
  totalDistance: distanceValueSchema,
  totalDuration: durationValueSchema,
  averagePace: paceValueSchema.optional(),
  isEstimate: exactSchema,
}).readonly();

export const sleepSummaryInputSchema = z.strictObject({
  durations: z.array(durationValueSchema).readonly(),
  outputUnit: durationUnitSchema,
}).readonly();
export const sleepSummaryResultSchema = z.strictObject({
  recordCount: z.number().finite().int().nonnegative(),
  totalDuration: durationValueSchema,
  averageDuration: durationValueSchema.optional(),
  isEstimate: exactSchema,
}).readonly();

export const activityFactorValueSchema = z.strictObject({
  value: decimalStringSchema.refine((value) => Number(value) > 0, "Expected a positive activity factor."),
  unit: z.literal("ratio"),
}).readonly();
export const tdeeInputSchema = z.strictObject({
  basalEnergy: energyValueSchema,
  basalEnergyPeriod: z.literal("day"),
  activityFactor: activityFactorValueSchema,
}).readonly();
export const tdeeResultSchema = z.strictObject({
  energy: energyValueSchema,
  period: z.literal("day"),
  isEstimate: estimateSchema,
}).readonly();

export const workoutVolumeSetInputSchema = z.strictObject({
  repetitions: repetitionCountSchema,
  weight: weightValueSchema,
}).readonly();
export const workoutVolumeInputSchema = z.strictObject({
  sets: z.array(workoutVolumeSetInputSchema).min(1).readonly(),
}).readonly();
export const workoutVolumeResultSchema = z.strictObject({
  load: workoutLoadValueSchema,
  isEstimate: exactSchema,
}).readonly();
