export interface WeightedGradeComponentInput {
  readonly score: number;
  readonly maximumScore: number;
  /** Contribution to the course grade, expressed as a percentage from 0 to 100. */
  readonly weightPercentage: number;
}

export interface WeightedGradeCalculationInput {
  readonly components: readonly WeightedGradeComponentInput[];
}

export interface WeightedGradeCalculationResult {
  /** Weighted course result expressed as a percentage from 0 to 100. */
  readonly weightedPercentage: number;
  readonly representedWeightPercentage: number;
}

export declare function calculateWeightedGrade(
  input: WeightedGradeCalculationInput,
): WeightedGradeCalculationResult;
