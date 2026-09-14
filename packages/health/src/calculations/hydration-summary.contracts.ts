import type { HydrationVolumeUnit, HydrationVolumeValue } from "../health-units.types.js";

/** Input hydration volumes carry units and select an output unit. */
export interface HydrationSummaryInput {
  readonly volumes: readonly HydrationVolumeValue[];
  readonly outputUnit: HydrationVolumeUnit;
}

/** Output volume carries a hydration unit and is not an estimate. */
export interface HydrationSummaryResult {
  readonly entryCount: number;
  readonly totalVolume: HydrationVolumeValue;
  readonly isEstimate: false;
}
