import type { DistanceUnit, DistanceValue, DurationValue, PaceValue } from "../health-units.types.js";

export interface RunningSummaryActivityInput {
  readonly distance: DistanceValue;
  readonly duration: DurationValue;
}

/** Activity input units are explicit; output distance selects a unit. No formula is implemented in Phase 2. */
export interface RunningSummaryInput {
  readonly activities: readonly RunningSummaryActivityInput[];
  readonly outputDistanceUnit: DistanceUnit;
}

/** Summary outputs carry distance, duration, and pace units and are not estimates. */
export interface RunningSummaryResult {
  readonly activityCount: number;
  readonly totalDistance: DistanceValue;
  readonly totalDuration: DurationValue;
  readonly averagePace?: PaceValue;
  readonly isEstimate: false;
}

export declare function calculateRunningSummary(input: RunningSummaryInput): RunningSummaryResult;
