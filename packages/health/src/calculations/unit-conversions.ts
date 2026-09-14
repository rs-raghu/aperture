import { Decimal } from "decimal.js";

import { decimal } from "./decimal.helpers.js";
import type {
  DistanceUnit,
  DurationUnit,
  HydrationVolumeUnit,
  PaceUnit,
  WeightUnit,
} from "../health-units.types.js";

const weightToKilograms: Readonly<Record<WeightUnit, string>> = {
  kilogram: "1",
  pound: "0.45359237",
};

const distanceToMeters: Readonly<Record<DistanceUnit, string>> = {
  meter: "1",
  kilometer: "1000",
  foot: "0.3048",
  mile: "1609.344",
};

const durationToSeconds: Readonly<Record<DurationUnit, string>> = {
  second: "1",
  minute: "60",
  hour: "3600",
};

const hydrationToMilliliters: Readonly<Record<HydrationVolumeUnit, string>> = {
  milliliter: "1",
  liter: "1000",
  fluid_ounce: "29.5735295625",
};

export function convertWeight(
  value: string,
  from: WeightUnit,
  to: WeightUnit,
): Decimal {
  return decimal(value).times(weightToKilograms[from]).dividedBy(weightToKilograms[to]);
}

export function heightToCentimeters(value: string, unit: "centimeter" | "inch"): Decimal {
  return decimal(value).times(unit === "inch" ? "2.54" : "1");
}

export function convertDistance(
  value: string,
  from: DistanceUnit,
  to: DistanceUnit,
): Decimal {
  return decimal(value).times(distanceToMeters[from]).dividedBy(distanceToMeters[to]);
}

export function convertDuration(
  value: string,
  from: DurationUnit,
  to: DurationUnit,
): Decimal {
  return decimal(value).times(durationToSeconds[from]).dividedBy(durationToSeconds[to]);
}

export function convertHydrationVolume(
  value: string,
  from: HydrationVolumeUnit,
  to: HydrationVolumeUnit,
): Decimal {
  return decimal(value).times(hydrationToMilliliters[from]).dividedBy(hydrationToMilliliters[to]);
}

export function paceDistanceUnit(unit: PaceUnit): "kilometer" | "mile" {
  return unit === "seconds_per_kilometer" ? "kilometer" : "mile";
}
