import { Decimal } from "decimal.js";

import {
  calculationDecimal,
  calculationIssue,
  calculationNumber,
  decimal,
  parseCalculationInput,
  parseCalculationResult,
} from "./decimal.helpers.js";
import {
  bmiInputSchema,
  bmiResultSchema,
  bmrInputSchema,
  bmrResultSchema,
  heartRateZonesInputSchema,
  heartRateZonesResultSchema,
  hydrationSummaryInputSchema,
  hydrationSummaryResultSchema,
  oneRepMaxInputSchema,
  oneRepMaxResultSchema,
  recoverySummaryInputSchema,
  recoverySummaryResultSchema,
  runningPaceInputSchema,
  runningPaceResultSchema,
  runningSummaryInputSchema,
  runningSummaryResultSchema,
  sleepSummaryInputSchema,
  sleepSummaryResultSchema,
  tdeeInputSchema,
  tdeeResultSchema,
  workoutVolumeInputSchema,
  workoutVolumeResultSchema,
} from "./calculation.schemas.js";
import {
  convertDistance,
  convertDuration,
  convertHydrationVolume,
  convertWeight,
  heightToCentimeters,
  paceDistanceUnit,
} from "./unit-conversions.js";
import type { BmiInput, BmiResult } from "./bmi.contracts.js";
import type { BmrInput, BmrResult } from "./bmr.contracts.js";
import type { HeartRateZonesInput, HeartRateZonesResult } from "./heart-rate-zones.contracts.js";
import type { HydrationSummaryInput, HydrationSummaryResult } from "./hydration-summary.contracts.js";
import type { OneRepMaxInput, OneRepMaxResult } from "./one-rep-max.contracts.js";
import type { RecoverySummaryInput, RecoverySummaryResult } from "./recovery-summary.contracts.js";
import type { RunningPaceInput, RunningPaceResult } from "./running-pace.contracts.js";
import type { RunningSummaryInput, RunningSummaryResult } from "./running-summary.contracts.js";
import type { SleepSummaryInput, SleepSummaryResult } from "./sleep-summary.contracts.js";
import type { TdeeInput, TdeeResult } from "./tdee.contracts.js";
import type { WorkoutVolumeInput, WorkoutVolumeResult } from "./workout-volume.contracts.js";

function sum(values: readonly Decimal[]): Decimal {
  return values.reduce((total, value) => total.plus(value), new Decimal(0));
}

export function calculateBmi(input: BmiInput): BmiResult {
  const parsed = parseCalculationInput(bmiInputSchema, input);
  const kilograms = convertWeight(parsed.weight.value, parsed.weight.unit, "kilogram");
  const meters = heightToCentimeters(parsed.height.value, parsed.height.unit).dividedBy(100);
  return parseCalculationResult(bmiResultSchema, {
    value: calculationDecimal(kilograms.dividedBy(meters.pow(2))),
    unit: "kilograms_per_square_meter" as const,
    isEstimate: false as const,
  });
}

export function calculateBmr(input: BmrInput): BmrResult {
  const parsed = parseCalculationInput(bmrInputSchema, input);
  const kilograms = convertWeight(parsed.weight.value, parsed.weight.unit, "kilogram");
  const centimeters = heightToCentimeters(parsed.height.value, parsed.height.unit);
  const sexConstant = parsed.sex === "male" ? 5 : parsed.sex === "female" ? -161 : -78;
  const energy = kilograms.times(10)
    .plus(centimeters.times("6.25"))
    .minus(decimal(parsed.age.value).times(5))
    .plus(sexConstant);
  if (energy.isNegative()) {
    calculationIssue([], "The supplied values do not produce a non-negative basal energy estimate.");
  }
  return parseCalculationResult(bmrResultSchema, {
    energy: { value: calculationDecimal(energy), unit: "kilocalorie" as const },
    period: "day" as const,
    isEstimate: true as const,
  });
}

export function calculateHeartRateZones(input: HeartRateZonesInput): HeartRateZonesResult {
  const parsed = parseCalculationInput(heartRateZonesInputSchema, input);
  const boundaries = parsed.zoneBoundaries.map((boundary) => decimal(boundary.value));
  for (let index = 1; index < boundaries.length; index += 1) {
    if (!boundaries[index]!.greaterThan(boundaries[index - 1]!)) {
      calculationIssue(["zoneBoundaries", index], "Zone boundaries must increase strictly.");
    }
  }

  const maximum = decimal(parsed.maximumHeartRate.value);
  const resting = parsed.restingHeartRate === undefined
    ? undefined
    : decimal(parsed.restingHeartRate.value);
  if (resting !== undefined && !maximum.greaterThan(resting)) {
    calculationIssue(["maximumHeartRate"], "Maximum heart rate must exceed resting heart rate.");
  }

  const rateAt = (percentage: Decimal): Decimal => {
    const ratio = percentage.dividedBy(100);
    return resting === undefined
      ? maximum.times(ratio)
      : resting.plus(maximum.minus(resting).times(ratio));
  };

  const zones = boundaries.slice(0, -1).map((lower, index) => ({
    zone: `zone_${index + 1}`,
    lowerBound: { value: calculationNumber(rateAt(lower)), unit: "beats_per_minute" as const },
    upperBound: { value: calculationNumber(rateAt(boundaries[index + 1]!)), unit: "beats_per_minute" as const },
  }));
  return parseCalculationResult(heartRateZonesResultSchema, { zones, isEstimate: true as const });
}

export function calculateHydrationSummary(input: HydrationSummaryInput): HydrationSummaryResult {
  const parsed = parseCalculationInput(hydrationSummaryInputSchema, input);
  const total = sum(parsed.volumes.map((volume) =>
    convertHydrationVolume(volume.value, volume.unit, parsed.outputUnit)));
  return parseCalculationResult(hydrationSummaryResultSchema, {
    entryCount: parsed.volumes.length,
    totalVolume: { value: calculationDecimal(total), unit: parsed.outputUnit },
    isEstimate: false as const,
  });
}

export function estimateOneRepMax(input: OneRepMaxInput): OneRepMaxResult {
  const parsed = parseCalculationInput(oneRepMaxInputSchema, input);
  if (parsed.repetitions.value < 1) {
    calculationIssue(["repetitions", "value"], "At least one repetition is required.");
  }
  const weight = decimal(parsed.weight.value);
  const estimate = parsed.repetitions.value === 1
    ? weight
    : weight.times(decimal(parsed.repetitions.value).dividedBy(30).plus(1));
  return parseCalculationResult(oneRepMaxResultSchema, {
    estimatedWeight: { value: calculationDecimal(estimate), unit: parsed.weight.unit },
    isEstimate: true as const,
  });
}

function averageRatings(values: readonly number[]): string | undefined {
  if (values.length === 0) return undefined;
  return calculationDecimal(sum(values.map((value) => decimal(value))).dividedBy(values.length));
}

export function calculateRecoverySummary(input: RecoverySummaryInput): RecoverySummaryResult {
  const parsed = parseCalculationInput(recoverySummaryInputSchema, input);
  const averageEnergy = averageRatings(parsed.entries.flatMap((entry) => entry.energy === undefined ? [] : [entry.energy.value]));
  const averageSoreness = averageRatings(parsed.entries.flatMap((entry) => entry.soreness === undefined ? [] : [entry.soreness.value]));
  const averageFatigue = averageRatings(parsed.entries.flatMap((entry) => entry.fatigue === undefined ? [] : [entry.fatigue.value]));
  const averageMood = averageRatings(parsed.entries.flatMap((entry) => entry.mood === undefined ? [] : [entry.mood.value]));
  return parseCalculationResult(recoverySummaryResultSchema, {
    entryCount: parsed.entries.length,
    ...(averageEnergy === undefined ? {} : { averageEnergy }),
    ...(averageSoreness === undefined ? {} : { averageSoreness }),
    ...(averageFatigue === undefined ? {} : { averageFatigue }),
    ...(averageMood === undefined ? {} : { averageMood }),
    ratingScale: "one_to_ten" as const,
    isEstimate: true as const,
  });
}

export function calculateRunningPace(input: RunningPaceInput): RunningPaceResult {
  const parsed = parseCalculationInput(runningPaceInputSchema, input);
  const distance = convertDistance(parsed.distance.value, parsed.distance.unit, paceDistanceUnit(parsed.outputUnit));
  const seconds = convertDuration(parsed.duration.value, parsed.duration.unit, "second");
  if (!distance.greaterThan(0)) {
    calculationIssue(["distance", "value"], "Running distance must be greater than zero.");
  }
  if (!seconds.greaterThan(0)) {
    calculationIssue(["duration", "value"], "Running duration must be greater than zero.");
  }
  return parseCalculationResult(runningPaceResultSchema, {
    pace: { value: calculationDecimal(seconds.dividedBy(distance)), unit: parsed.outputUnit },
    isEstimate: false as const,
  });
}

export function calculateRunningSummary(input: RunningSummaryInput): RunningSummaryResult {
  const parsed = parseCalculationInput(runningSummaryInputSchema, input);
  const totalDistance = sum(parsed.activities.map((activity) =>
    convertDistance(activity.distance.value, activity.distance.unit, parsed.outputDistanceUnit)));
  const totalSeconds = sum(parsed.activities.map((activity) =>
    convertDuration(activity.duration.value, activity.duration.unit, "second")));
  const paceUnit = parsed.outputDistanceUnit === "mile" || parsed.outputDistanceUnit === "foot"
    ? "seconds_per_mile" as const
    : "seconds_per_kilometer" as const;
  const paceDistance = convertDistance(calculationDecimal(totalDistance), parsed.outputDistanceUnit, paceDistanceUnit(paceUnit));
  const averagePace = totalSeconds.greaterThan(0) && paceDistance.greaterThan(0)
    ? { value: calculationDecimal(totalSeconds.dividedBy(paceDistance)), unit: paceUnit }
    : undefined;
  return parseCalculationResult(runningSummaryResultSchema, {
    activityCount: parsed.activities.length,
    totalDistance: { value: calculationDecimal(totalDistance), unit: parsed.outputDistanceUnit },
    totalDuration: { value: calculationDecimal(totalSeconds), unit: "second" as const },
    ...(averagePace === undefined ? {} : { averagePace }),
    isEstimate: false as const,
  });
}

export function calculateSleepSummary(input: SleepSummaryInput): SleepSummaryResult {
  const parsed = parseCalculationInput(sleepSummaryInputSchema, input);
  const total = sum(parsed.durations.map((duration) =>
    convertDuration(duration.value, duration.unit, parsed.outputUnit)));
  const averageDuration = parsed.durations.length === 0
    ? undefined
    : { value: calculationDecimal(total.dividedBy(parsed.durations.length)), unit: parsed.outputUnit };
  return parseCalculationResult(sleepSummaryResultSchema, {
    recordCount: parsed.durations.length,
    totalDuration: { value: calculationDecimal(total), unit: parsed.outputUnit },
    ...(averageDuration === undefined ? {} : { averageDuration }),
    isEstimate: false as const,
  });
}

export function calculateTdee(input: TdeeInput): TdeeResult {
  const parsed = parseCalculationInput(tdeeInputSchema, input);
  return parseCalculationResult(tdeeResultSchema, {
    energy: {
      value: calculationDecimal(decimal(parsed.basalEnergy.value).times(parsed.activityFactor.value)),
      unit: parsed.basalEnergy.unit,
    },
    period: "day" as const,
    isEstimate: true as const,
  });
}

export function calculateWorkoutVolume(input: WorkoutVolumeInput): WorkoutVolumeResult {
  const parsed = parseCalculationInput(workoutVolumeInputSchema, input);
  const outputWeightUnit = parsed.sets[0]!.weight.unit;
  const load = sum(parsed.sets.map((set) =>
    convertWeight(set.weight.value, set.weight.unit, outputWeightUnit).times(set.repetitions.value)));
  return parseCalculationResult(workoutVolumeResultSchema, {
    load: {
      value: calculationDecimal(load),
      unit: outputWeightUnit === "kilogram" ? "kilogram_repetition" as const : "pound_repetition" as const,
    },
    isEstimate: false as const,
  });
}
