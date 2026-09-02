import type { RepetitionCount, WeightValue } from "../health-units.types.js";

/** Input carries weight and repetition units. No formula is implemented in Phase 2. */
export interface OneRepMaxInput {
  readonly weight: WeightValue;
  readonly repetitions: RepetitionCount;
}

/** Output carries a weight unit and is explicitly an estimate. */
export interface OneRepMaxResult {
  readonly estimatedWeight: WeightValue;
  readonly isEstimate: true;
}

export declare function estimateOneRepMax(input: OneRepMaxInput): OneRepMaxResult;
