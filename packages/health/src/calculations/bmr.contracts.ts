import type { EnergyValue, HeightValue, WeightValue } from "../health-units.types.js";

export type BmrSexInput = "female" | "male" | "unspecified";
export interface AgeValue {
  readonly value: number;
  readonly unit: "year";
}

/** Input units are carried by weight, height, and age. */
export interface BmrInput {
  readonly weight: WeightValue;
  readonly height: HeightValue;
  readonly age: AgeValue;
  readonly sex: BmrSexInput;
}

/** BMR output is energy per day and is explicitly an estimate. */
export interface BmrResult {
  readonly energy: EnergyValue;
  readonly period: "day";
  readonly isEstimate: true;
}
