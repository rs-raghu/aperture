import { Decimal } from "decimal.js";
import { z } from "@aperture/validation";

import { calculationDecimalSchema, calculationPercentageSchema, positiveCalculationDecimalSchema } from "./calculation.schemas.js";
import { optionalRoundingOptionsSchema, resolveRoundingOptions } from "./calculation.types.js";
import { calculationIssue, decimal, parseCalculationInput, roundedDecimal, roundingMetadata } from "./decimal.helpers.js";

export const requiredScoreFeasibilityStatuses = ["already-achieved", "achievable", "requires-extra-credit", "impossible", "insufficient-remaining-weight"] as const;
export const requiredScoreFeasibilitySchema = z.enum(requiredScoreFeasibilityStatuses);
export type RequiredScoreFeasibility = z.infer<typeof requiredScoreFeasibilitySchema>;

export const requiredScoreExplanationCodes = ["target-already-achieved", "score-achievable", "extra-credit-required", "score-impossible", "remaining-weight-insufficient"] as const;
export const requiredScoreExplanationCodeSchema = z.enum(requiredScoreExplanationCodes);
export type RequiredScoreExplanationCode = z.infer<typeof requiredScoreExplanationCodeSchema>;

export const requiredScoreCalculationInputSchema = z.strictObject({
  weightedPointsEarned: calculationPercentageSchema,
  completedWeightPercentage: calculationPercentageSchema,
  remainingAssessmentWeightPercentage: calculationPercentageSchema,
  remainingAssessmentMaximumScore: positiveCalculationDecimalSchema,
  targetFinalPercentage: calculationPercentageSchema,
  allowExtraCredit: z.boolean().default(false),
  rounding: optionalRoundingOptionsSchema,
});
export type RequiredScoreCalculationInput = z.input<typeof requiredScoreCalculationInputSchema>;

export interface RequiredScoreCalculationResult {
  readonly exactRequiredAssessmentPercentage: string;
  readonly roundedRequiredAssessmentPercentage: string;
  readonly exactRequiredRawScore: string;
  readonly roundedRequiredRawScore: string;
  readonly remainingAssessmentMaximumScore: string;
  readonly feasibility: RequiredScoreFeasibility;
  readonly targetAlreadyAchieved: boolean;
  readonly explanationCode: RequiredScoreExplanationCode;
  readonly rounding: ReturnType<typeof roundingMetadata>;
}

export const requiredScoreCalculationResultSchema = z.strictObject({
  exactRequiredAssessmentPercentage: calculationDecimalSchema,
  roundedRequiredAssessmentPercentage: calculationDecimalSchema,
  exactRequiredRawScore: calculationDecimalSchema,
  roundedRequiredRawScore: calculationDecimalSchema,
  remainingAssessmentMaximumScore: positiveCalculationDecimalSchema,
  feasibility: requiredScoreFeasibilitySchema,
  targetAlreadyAchieved: z.boolean(),
  explanationCode: requiredScoreExplanationCodeSchema,
  rounding: z.strictObject({ decimalPlaces: z.number().int().min(0).max(12), mode: z.enum(["half-up", "half-even", "down", "up"]) }),
});

export function calculateRequiredScore(input: RequiredScoreCalculationInput): RequiredScoreCalculationResult {
  const parsed = parseCalculationInput(requiredScoreCalculationInputSchema, input);
  const rounding = resolveRoundingOptions(parsed.rounding);
  const earned = decimal(parsed.weightedPointsEarned);
  const completedWeight = decimal(parsed.completedWeightPercentage);
  const remainingWeight = decimal(parsed.remainingAssessmentWeightPercentage);
  const target = decimal(parsed.targetFinalPercentage);
  if (earned.greaterThan(completedWeight)) calculationIssue(["weightedPointsEarned"], "Weighted points earned cannot exceed completed course weight.");
  if (completedWeight.plus(remainingWeight).greaterThan(100)) calculationIssue(["remainingAssessmentWeightPercentage"], "Completed and remaining course weight cannot exceed 100.");

  const maximumScore = decimal(parsed.remainingAssessmentMaximumScore);
  let requiredPercentage = new Decimal(0);
  let feasibility: RequiredScoreFeasibility;
  let explanationCode: RequiredScoreExplanationCode;
  let targetAlreadyAchieved = false;

  if (earned.greaterThanOrEqualTo(target)) {
    feasibility = "already-achieved";
    explanationCode = "target-already-achieved";
    targetAlreadyAchieved = true;
  } else {
    if (remainingWeight.isZero()) calculationIssue(["remainingAssessmentWeightPercentage"], "Remaining assessment weight must be greater than zero when a score is required.");
    requiredPercentage = target.minus(earned).dividedBy(remainingWeight).times(100);
    if (requiredPercentage.lessThanOrEqualTo(100)) {
      feasibility = "achievable";
      explanationCode = "score-achievable";
    } else if (parsed.allowExtraCredit) {
      feasibility = "requires-extra-credit";
      explanationCode = "extra-credit-required";
    } else if (completedWeight.plus(remainingWeight).lessThan(target)) {
      feasibility = "insufficient-remaining-weight";
      explanationCode = "remaining-weight-insufficient";
    } else {
      feasibility = "impossible";
      explanationCode = "score-impossible";
    }
  }

  const rawScore = maximumScore.times(requiredPercentage).dividedBy(100);
  const percentageResult = roundedDecimal(requiredPercentage, rounding);
  const rawResult = roundedDecimal(rawScore, rounding);
  return {
    exactRequiredAssessmentPercentage: percentageResult.exact,
    roundedRequiredAssessmentPercentage: percentageResult.rounded,
    exactRequiredRawScore: rawResult.exact,
    roundedRequiredRawScore: rawResult.rounded,
    remainingAssessmentMaximumScore: maximumScore.toFixed(),
    feasibility,
    targetAlreadyAchieved,
    explanationCode,
    rounding: roundingMetadata(rounding),
  };
}
