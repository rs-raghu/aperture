export interface DegreeProgressCalculationInput {
  readonly completedCreditUnits: number;
  readonly requiredCreditUnits: number;
}

export interface DegreeProgressCalculationResult {
  /** Degree completion expressed as a percentage from 0 to 100. */
  readonly progressPercentage: number;
  readonly completedCreditUnits: number;
  readonly remainingCreditUnits: number;
  readonly requiredCreditUnits: number;
}

export declare function calculateDegreeProgress(
  input: DegreeProgressCalculationInput,
): DegreeProgressCalculationResult;
