import type { HeartRateValue, PercentageValue } from "../health-units.types.js";

/** Input heart rates use beats per minute. No formula is implemented in Phase 2. */
export interface HeartRateZonesInput {
  readonly restingHeartRate?: HeartRateValue;
  readonly maximumHeartRate: HeartRateValue;
  readonly zoneBoundaries: readonly PercentageValue[];
}

export interface HeartRateZoneResult {
  readonly zone: string;
  readonly lowerBound: HeartRateValue;
  readonly upperBound: HeartRateValue;
}

/** Zone bounds use beats per minute and are explicitly estimates. */
export interface HeartRateZonesResult {
  readonly zones: readonly HeartRateZoneResult[];
  readonly isEstimate: true;
}

export declare function calculateHeartRateZones(input: HeartRateZonesInput): HeartRateZonesResult;
