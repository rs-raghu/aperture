export interface RequiredScoreCalculationInput {
  /** Weighted percentage points already earned toward the course result. */
  readonly earnedWeightedPercentage: number;
  /** Remaining contribution to the course grade, from 0 to 100. */
  readonly remainingWeightPercentage: number;
  /** Desired final course percentage, from 0 to 100. */
  readonly targetPercentage: number;
}

export interface RequiredScoreCalculationResult {
  /** Percentage required across the remaining weighted work. */
  readonly requiredScorePercentage: number;
  readonly attainable: boolean;
}

export declare function calculateRequiredScore(
  input: RequiredScoreCalculationInput,
): RequiredScoreCalculationResult;
