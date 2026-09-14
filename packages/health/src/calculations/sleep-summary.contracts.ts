import type { DurationUnit, DurationValue } from "../health-units.types.js";

/** Input sleep durations carry units and select an output unit. */
export interface SleepSummaryInput {
  readonly durations: readonly DurationValue[];
  readonly outputUnit: DurationUnit;
}

/** Output durations carry units and are not estimates. */
export interface SleepSummaryResult {
  readonly recordCount: number;
  readonly totalDuration: DurationValue;
  readonly averageDuration?: DurationValue;
  readonly isEstimate: false;
}
