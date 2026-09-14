import type { RepetitionCount, WeightValue, WorkoutLoadValue } from "../health-units.types.js";

export interface WorkoutVolumeSetInput {
  readonly repetitions: RepetitionCount;
  readonly weight: WeightValue;
}

/** Set inputs carry repetition and weight units. */
export interface WorkoutVolumeInput {
  readonly sets: readonly WorkoutVolumeSetInput[];
}

/** Output uses weight-repetition load units and is not an estimate. */
export interface WorkoutVolumeResult {
  readonly load: WorkoutLoadValue;
  readonly isEstimate: false;
}
