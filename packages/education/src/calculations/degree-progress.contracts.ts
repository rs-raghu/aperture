import { Decimal } from "decimal.js";
import { z } from "@aperture/validation";

import { calculationDecimalSchema, positiveCalculationDecimalSchema } from "./calculation.schemas.js";
import { optionalRoundingOptionsSchema, resolveRoundingOptions } from "./calculation.types.js";
import { decimal, parseCalculationInput, roundedDecimal, roundingMetadata } from "./decimal.helpers.js";

export const degreeCompletionStatuses = ["not-started", "in-progress", "complete", "exceeded"] as const;
export const degreeCompletionStatusSchema = z.enum(degreeCompletionStatuses);
export type DegreeCompletionStatus = z.infer<typeof degreeCompletionStatusSchema>;

export const degreeProgressCalculationInputSchema = z.strictObject({
  requiredCredits: positiveCalculationDecimalSchema,
  completedCredits: calculationDecimalSchema,
  inProgressCredits: calculationDecimalSchema,
  transferredCredits: calculationDecimalSchema,
  includeTransferredCredits: z.boolean(),
  rounding: optionalRoundingOptionsSchema,
});
export type DegreeProgressCalculationInput = z.input<typeof degreeProgressCalculationInputSchema>;

export interface DegreeProgressCalculationResult {
  readonly requiredCredits: string;
  readonly applicableCompletedCredits: string;
  readonly inProgressCredits: string;
  readonly remainingCredits: string;
  readonly excessCredits: string;
  readonly exactProgressPercentage: string;
  readonly roundedProgressPercentage: string;
  readonly displayCappedProgressPercentage: string;
  readonly completionStatus: DegreeCompletionStatus;
  readonly includeTransferredCredits: boolean;
  readonly rounding: ReturnType<typeof roundingMetadata>;
}

export const degreeProgressCalculationResultSchema = z.strictObject({
  requiredCredits: positiveCalculationDecimalSchema,
  applicableCompletedCredits: calculationDecimalSchema,
  inProgressCredits: calculationDecimalSchema,
  remainingCredits: calculationDecimalSchema,
  excessCredits: calculationDecimalSchema,
  exactProgressPercentage: calculationDecimalSchema,
  roundedProgressPercentage: calculationDecimalSchema,
  displayCappedProgressPercentage: calculationDecimalSchema,
  completionStatus: degreeCompletionStatusSchema,
  includeTransferredCredits: z.boolean(),
  rounding: z.strictObject({ decimalPlaces: z.number().int().min(0).max(12), mode: z.enum(["half-up", "half-even", "down", "up"]) }),
});

export function calculateDegreeProgress(input: DegreeProgressCalculationInput): DegreeProgressCalculationResult {
  const parsed = parseCalculationInput(degreeProgressCalculationInputSchema, input);
  const rounding = resolveRoundingOptions(parsed.rounding);
  const required = decimal(parsed.requiredCredits);
  const completed = decimal(parsed.completedCredits);
  const transferred = decimal(parsed.transferredCredits);
  const applicable = parsed.includeTransferredCredits ? completed.plus(transferred) : completed;
  const difference = required.minus(applicable);
  const remaining = Decimal.max(difference, 0);
  const excess = Decimal.max(difference.negated(), 0);
  const progressValue = applicable.dividedBy(required).times(100);
  const progress = roundedDecimal(progressValue, rounding);
  const capped = roundedDecimal(Decimal.min(progressValue, 100), rounding);
  const completionStatus: DegreeCompletionStatus = applicable.isZero()
    ? "not-started"
    : applicable.lessThan(required)
      ? "in-progress"
      : applicable.equals(required)
        ? "complete"
        : "exceeded";

  return {
    requiredCredits: required.toFixed(),
    applicableCompletedCredits: applicable.toFixed(),
    inProgressCredits: decimal(parsed.inProgressCredits).toFixed(),
    remainingCredits: remaining.toFixed(),
    excessCredits: excess.toFixed(),
    exactProgressPercentage: progress.exact,
    roundedProgressPercentage: progress.rounded,
    displayCappedProgressPercentage: capped.rounded,
    completionStatus,
    includeTransferredCredits: parsed.includeTransferredCredits,
    rounding: roundingMetadata(rounding),
  };
}
