import type { DecimalString } from "../health.types.js";
import type { HeartRateValue, HeartRateVariabilityValue } from "../health-units.types.js";
import type { RecoveryRating } from "../recovery/recovery-entry.types.js";

export interface RecoverySummaryEntryInput {
  readonly energy?: RecoveryRating;
  readonly soreness?: RecoveryRating;
  readonly fatigue?: RecoveryRating;
  readonly mood?: RecoveryRating;
  readonly restingHeartRate?: HeartRateValue;
  readonly heartRateVariability?: HeartRateVariabilityValue;
}

/** Ratings use one-to-ten scales; physiological values carry units. No formula is implemented in Phase 2. */
export interface RecoverySummaryInput {
  readonly entries: readonly RecoverySummaryEntryInput[];
}

/** Aggregate ratings use the one-to-ten scale and are explicitly estimates. */
export interface RecoverySummaryResult {
  readonly entryCount: number;
  readonly averageEnergy?: DecimalString;
  readonly averageSoreness?: DecimalString;
  readonly averageFatigue?: DecimalString;
  readonly averageMood?: DecimalString;
  readonly ratingScale: "one_to_ten";
  readonly isEstimate: true;
}

export declare function calculateRecoverySummary(input: RecoverySummaryInput): RecoverySummaryResult;
