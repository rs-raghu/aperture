import { Decimal } from "decimal.js";
import { z } from "@aperture/validation";

import { calculationDecimalSchema, calculationIdentifierSchema, calculationPercentageSchema, positiveCalculationDecimalSchema } from "./calculation.schemas.js";
import { optionalRoundingOptionsSchema, resolveRoundingOptions } from "./calculation.types.js";
import type { CalculationWarningCode } from "./calculation.types.js";
import { calculationIssue, decimal, parseCalculationInput, roundedDecimal, roundingMetadata } from "./decimal.helpers.js";

export const weightedGradeComponentInputSchema = z.strictObject({
  componentId: calculationIdentifierSchema,
  scoreEarned: calculationDecimalSchema,
  maximumScore: positiveCalculationDecimalSchema,
  weightPercentage: calculationDecimalSchema,
  included: z.boolean().default(true),
});
export type WeightedGradeComponentInput = z.input<typeof weightedGradeComponentInputSchema>;

export const weightedGradeCalculationInputSchema = z.strictObject({
  components: z.array(weightedGradeComponentInputSchema).min(1),
  allowExtraCredit: z.boolean().default(false),
  allowTotalWeightAbove100: z.boolean().default(false),
  rounding: optionalRoundingOptionsSchema,
});
export type WeightedGradeCalculationInput = z.input<typeof weightedGradeCalculationInputSchema>;

export interface WeightedGradeCalculationResult {
  readonly includedComponentCount: number;
  readonly excludedComponentCount: number;
  readonly totalIncludedWeight: string;
  readonly weightedPointsEarned: string;
  readonly exactCurrentGrade: string;
  readonly roundedCurrentGrade: string;
  readonly exactFinalCourseContribution: string;
  readonly roundedFinalCourseContribution: string;
  readonly warnings: readonly CalculationWarningCode[];
  readonly rounding: ReturnType<typeof roundingMetadata>;
}

export const weightedGradeCalculationResultSchema = z.strictObject({
  includedComponentCount: z.number().int().nonnegative(),
  excludedComponentCount: z.number().int().nonnegative(),
  totalIncludedWeight: calculationDecimalSchema,
  weightedPointsEarned: calculationDecimalSchema,
  exactCurrentGrade: calculationDecimalSchema,
  roundedCurrentGrade: calculationDecimalSchema,
  exactFinalCourseContribution: calculationDecimalSchema,
  roundedFinalCourseContribution: calculationDecimalSchema,
  warnings: z.array(z.enum(["partial-weight", "weight-above-100", "extra-credit", "incomplete-projection-assumptions"])),
  rounding: z.strictObject({ decimalPlaces: z.number().int().min(0).max(12), mode: z.enum(["half-up", "half-even", "down", "up"]) }),
});

export function calculateWeightedGrade(input: WeightedGradeCalculationInput): WeightedGradeCalculationResult {
  const parsed = parseCalculationInput(weightedGradeCalculationInputSchema, input);
  const rounding = resolveRoundingOptions(parsed.rounding);
  const included = parsed.components.filter((component) => component.included);
  if (included.length === 0) calculationIssue(["components"], "At least one component must be included.");

  let totalWeight = new Decimal(0);
  let earned = new Decimal(0);
  let hasExtraCredit = false;
  for (const [index, component] of parsed.components.entries()) {
    const score = decimal(component.scoreEarned);
    const maximum = decimal(component.maximumScore);
    if (score.greaterThan(maximum)) {
      if (!parsed.allowExtraCredit) calculationIssue(["components", index, "scoreEarned"], "Score earned cannot exceed maximum score unless extra credit is enabled.");
      hasExtraCredit = true;
    }
    if (!component.included) continue;
    const weight = decimal(component.weightPercentage);
    totalWeight = totalWeight.plus(weight);
    earned = earned.plus(score.dividedBy(maximum).times(weight));
  }

  if (totalWeight.isZero()) calculationIssue(["components"], "Total included weight must be greater than zero.");
  if (totalWeight.greaterThan(100) && !parsed.allowTotalWeightAbove100) calculationIssue(["components"], "Total included weight cannot exceed 100 unless explicitly permitted.");

  const current = roundedDecimal(earned.dividedBy(totalWeight).times(100), rounding);
  const contribution = roundedDecimal(earned, rounding);
  const warnings: CalculationWarningCode[] = [];
  if (totalWeight.lessThan(100)) warnings.push("partial-weight");
  if (totalWeight.greaterThan(100)) warnings.push("weight-above-100");
  if (hasExtraCredit) warnings.push("extra-credit");

  return {
    includedComponentCount: included.length,
    excludedComponentCount: parsed.components.length - included.length,
    totalIncludedWeight: totalWeight.toFixed(),
    weightedPointsEarned: earned.toFixed(),
    exactCurrentGrade: current.exact,
    roundedCurrentGrade: current.rounded,
    exactFinalCourseContribution: contribution.exact,
    roundedFinalCourseContribution: contribution.rounded,
    warnings,
    rounding: roundingMetadata(rounding),
  };
}
