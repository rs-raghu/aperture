import type { DistanceValue, DurationValue, PaceUnit, PaceValue } from "../health-units.types.js";

/** Input units are carried by distance and duration. No formula is implemented in Phase 2. */
export interface RunningPaceInput {
  readonly distance: DistanceValue;
  readonly duration: DurationValue;
  readonly outputUnit: PaceUnit;
}

/** Pace output carries seconds-per-distance units and is not an estimate. */
export interface RunningPaceResult {
  readonly pace: PaceValue;
  readonly isEstimate: false;
}

export declare function calculateRunningPace(input: RunningPaceInput): RunningPaceResult;
