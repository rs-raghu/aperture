import { Decimal } from "decimal.js";
import { z } from "@aperture/validation";

import { calculationDecimalSchema, calculationIdentifierSchema, calculationPercentageSchema } from "./calculation.schemas.js";
import { optionalRoundingOptionsSchema, resolveRoundingOptions } from "./calculation.types.js";
import type { CalculationWarningCode } from "./calculation.types.js";
import { calculationIssue, decimal, parseCalculationInput, roundedDecimal, roundingMetadata } from "./decimal.helpers.js";
import { weightedGradeComponentInputSchema } from "./weighted-grade.contracts.js";

export const plannedGradeComponentInputSchema = z.strictObject({
  componentId: calculationIdentifierSchema,
  weightPercentage: calculationPercentageSchema,
  expectedPercentage: calculationPercentageSchema.optional(),
});
export type PlannedGradeComponentInput = z.input<typeof plannedGradeComponentInputSchema>;

export const missingExpectedScorePolicies = ["reject", "exclude-from-projection"] as const;
export const missingExpectedScorePolicySchema = z.enum(missingExpectedScorePolicies);
export type MissingExpectedScorePolicy = z.infer<typeof missingExpectedScorePolicySchema>;

export const gradeProjectionInputSchema = z.strictObject({
  completedComponents: z.array(weightedGradeComponentInputSchema),
  remainingComponents: z.array(plannedGradeComponentInputSchema),
  defaultExpectedPercentage: calculationPercentageSchema.optional(),
  missingExpectedScorePolicy: missingExpectedScorePolicySchema.default("reject"),
  rounding: optionalRoundingOptionsSchema,
});
export type GradeProjectionInput = z.input<typeof gradeProjectionInputSchema>;

export interface GradeProjectionResult {
  readonly completedWeight: string;
  readonly remainingWeight: string;
  readonly weightedPointsAlreadyEarned: string;
  readonly expectedRemainingContribution: string;
  readonly exactProjectedFinalPercentage: string;
  readonly roundedProjectedFinalPercentage: string;
  readonly exactBestPossibleFinalPercentage: string;
  readonly roundedBestPossibleFinalPercentage: string;
  readonly exactLowestPossibleFinalPercentage: string;
  readonly roundedLowestPossibleFinalPercentage: string;
  readonly unresolvedRemainingWeight: string;
  readonly assumptions: readonly string[];
  readonly warnings: readonly CalculationWarningCode[];
  readonly rounding: ReturnType<typeof roundingMetadata>;
}

export const gradeProjectionResultSchema = z.strictObject({
  completedWeight: calculationPercentageSchema,
  remainingWeight: calculationPercentageSchema,
  weightedPointsAlreadyEarned: calculationDecimalSchema,
  expectedRemainingContribution: calculationDecimalSchema,
  exactProjectedFinalPercentage: calculationDecimalSchema,
  roundedProjectedFinalPercentage: calculationDecimalSchema,
  exactBestPossibleFinalPercentage: calculationDecimalSchema,
  roundedBestPossibleFinalPercentage: calculationDecimalSchema,
  exactLowestPossibleFinalPercentage: calculationDecimalSchema,
  roundedLowestPossibleFinalPercentage: calculationDecimalSchema,
  unresolvedRemainingWeight: calculationPercentageSchema,
  assumptions: z.array(z.string()),
  warnings: z.array(z.enum(["partial-weight", "weight-above-100", "extra-credit", "incomplete-projection-assumptions"])),
  rounding: z.strictObject({ decimalPlaces: z.number().int().min(0).max(12), mode: z.enum(["half-up", "half-even", "down", "up"]) }),
});

export function projectCourseGrade(input: GradeProjectionInput): GradeProjectionResult {
  const parsed = parseCalculationInput(gradeProjectionInputSchema, input);
  const rounding = resolveRoundingOptions(parsed.rounding);
  const completedIds = new Set<string>();
  for (const [index, component] of parsed.completedComponents.entries()) {
    if (completedIds.has(component.componentId)) calculationIssue(["completedComponents", index, "componentId"], "Completed component identifiers must be unique.");
    completedIds.add(component.componentId);
  }
  const remainingIds = new Set<string>();
  for (const [index, component] of parsed.remainingComponents.entries()) {
    if (completedIds.has(component.componentId)) calculationIssue(["remainingComponents", index, "componentId"], "Completed and remaining components cannot overlap.");
    if (remainingIds.has(component.componentId)) calculationIssue(["remainingComponents", index, "componentId"], "Remaining component identifiers must be unique.");
    remainingIds.add(component.componentId);
  }

  let completedWeight = new Decimal(0);
  let earned = new Decimal(0);
  for (const [index, component] of parsed.completedComponents.entries()) {
    const score = decimal(component.scoreEarned);
    const maximum = decimal(component.maximumScore);
    if (score.greaterThan(maximum)) calculationIssue(["completedComponents", index, "scoreEarned"], "Completed component score cannot exceed its maximum.");
    if (!component.included) continue;
    const weight = decimal(component.weightPercentage);
    completedWeight = completedWeight.plus(weight);
    earned = earned.plus(score.dividedBy(maximum).times(weight));
  }

  let remainingWeight = new Decimal(0);
  let expectedContribution = new Decimal(0);
  let unresolvedWeight = new Decimal(0);
  const assumptions: string[] = [];
  for (const [index, component] of parsed.remainingComponents.entries()) {
    const weight = decimal(component.weightPercentage);
    remainingWeight = remainingWeight.plus(weight);
    const expected = component.expectedPercentage ?? parsed.defaultExpectedPercentage;
    if (expected === undefined) {
      if (parsed.missingExpectedScorePolicy === "reject") calculationIssue(["remainingComponents", index, "expectedPercentage"], "An expected percentage is required for every remaining component.");
      unresolvedWeight = unresolvedWeight.plus(weight);
      continue;
    }
    expectedContribution = expectedContribution.plus(decimal(expected).dividedBy(100).times(weight));
    assumptions.push(`${component.componentId}:${expected}%`);
  }

  const totalWeight = completedWeight.plus(remainingWeight);
  if (totalWeight.greaterThan(100)) calculationIssue(["remainingComponents"], "Completed and remaining weights cannot total more than 100.");
  const projected = roundedDecimal(earned.plus(expectedContribution), rounding);
  const best = roundedDecimal(earned.plus(remainingWeight), rounding);
  const lowest = roundedDecimal(earned, rounding);
  const warnings: CalculationWarningCode[] = [];
  if (totalWeight.lessThan(100)) warnings.push("partial-weight");
  if (!unresolvedWeight.isZero()) warnings.push("incomplete-projection-assumptions");

  return {
    completedWeight: completedWeight.toFixed(),
    remainingWeight: remainingWeight.toFixed(),
    weightedPointsAlreadyEarned: earned.toFixed(),
    expectedRemainingContribution: expectedContribution.toFixed(),
    exactProjectedFinalPercentage: projected.exact,
    roundedProjectedFinalPercentage: projected.rounded,
    exactBestPossibleFinalPercentage: best.exact,
    roundedBestPossibleFinalPercentage: best.rounded,
    exactLowestPossibleFinalPercentage: lowest.exact,
    roundedLowestPossibleFinalPercentage: lowest.rounded,
    unresolvedRemainingWeight: unresolvedWeight.toFixed(),
    assumptions,
    warnings,
    rounding: roundingMetadata(rounding),
  };
}
