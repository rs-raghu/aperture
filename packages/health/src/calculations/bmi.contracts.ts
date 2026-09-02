import type { DecimalString } from "../health.types.js";
import type { HeightValue, WeightValue } from "../health-units.types.js";

/** Input units are carried by weight and height. No formula is implemented in Phase 2. */
export interface BmiInput {
  readonly weight: WeightValue;
  readonly height: HeightValue;
}

/** BMI output uses kilograms per square meter and is not an estimate. */
export interface BmiResult {
  readonly value: DecimalString;
  readonly unit: "kilograms_per_square_meter";
  readonly isEstimate: false;
}

export declare function calculateBmi(input: BmiInput): BmiResult;
