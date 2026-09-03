import { Decimal } from "decimal.js";
import { z } from "@aperture/validation";

import { courseIdSchema } from "../courses/course.types.js";
import { calculationDecimalSchema, positiveCalculationDecimalSchema } from "./calculation.schemas.js";
import { optionalRoundingOptionsSchema, resolveRoundingOptions } from "./calculation.types.js";
import { calculationIssue, decimal, parseCalculationInput, roundedDecimal, roundingMetadata } from "./decimal.helpers.js";

export const zeroCreditPolicies = ["reject", "exclude"] as const;
export const zeroCreditPolicySchema = z.enum(zeroCreditPolicies);
export type ZeroCreditPolicy = z.infer<typeof zeroCreditPolicySchema>;

export const gpaCourseInputSchema = z.strictObject({
  courseId: courseIdSchema,
  credits: calculationDecimalSchema,
  gradePoints: calculationDecimalSchema,
  included: z.boolean().default(true),
});
export type GpaCourseInput = z.input<typeof gpaCourseInputSchema>;

export const gpaCalculationInputSchema = z.strictObject({
  courses: z.array(gpaCourseInputSchema).min(1),
  gradePointScale: positiveCalculationDecimalSchema,
  zeroCreditPolicy: zeroCreditPolicySchema.default("reject"),
  rounding: optionalRoundingOptionsSchema,
});
export type GpaCalculationInput = z.input<typeof gpaCalculationInputSchema>;

export interface GpaCalculationResult {
  readonly includedCourseCount: number;
  readonly excludedCourseCount: number;
  readonly totalIncludedCredits: string;
  readonly totalQualityPoints: string;
  readonly exactGpa: string;
  readonly roundedGpa: string;
  readonly gradePointScale: string;
  readonly rounding: ReturnType<typeof roundingMetadata>;
}

export const gpaCalculationResultSchema = z.strictObject({
  includedCourseCount: z.number().int().nonnegative(),
  excludedCourseCount: z.number().int().nonnegative(),
  totalIncludedCredits: calculationDecimalSchema,
  totalQualityPoints: calculationDecimalSchema,
  exactGpa: calculationDecimalSchema,
  roundedGpa: calculationDecimalSchema,
  gradePointScale: positiveCalculationDecimalSchema,
  rounding: z.strictObject({ decimalPlaces: z.number().int().min(0).max(12), mode: z.enum(["half-up", "half-even", "down", "up"]) }),
});

export function calculateGpa(input: GpaCalculationInput): GpaCalculationResult {
  const parsed = parseCalculationInput(gpaCalculationInputSchema, input);
  const rounding = resolveRoundingOptions(parsed.rounding);
  const scale = decimal(parsed.gradePointScale);
  for (const [index, course] of parsed.courses.entries()) {
    if (decimal(course.gradePoints).greaterThan(scale)) calculationIssue(["courses", index, "gradePoints"], "Grade points cannot exceed the configured scale.");
  }
  const included = parsed.courses.filter((course, index) => {
    if (!course.included) return false;
    if (decimal(course.credits).isZero()) {
      if (parsed.zeroCreditPolicy === "reject") {
        calculationIssue(["courses", index, "credits"], "Included courses must have credits greater than zero.");
      }
      return false;
    }
    return true;
  });

  if (included.length === 0) calculationIssue(["courses"], "At least one positive-credit course must be included.");

  let totalCredits = new Decimal(0);
  let totalQualityPoints = new Decimal(0);
  for (const [index, course] of parsed.courses.entries()) {
    if (!course.included || decimal(course.credits).isZero()) continue;
    const gradePoints = decimal(course.gradePoints);
    const credits = decimal(course.credits);
    totalCredits = totalCredits.plus(credits);
    totalQualityPoints = totalQualityPoints.plus(gradePoints.times(credits));
  }

  if (totalCredits.isZero()) calculationIssue(["courses"], "Total included credits must be greater than zero.");
  const gpa = roundedDecimal(totalQualityPoints.dividedBy(totalCredits), rounding);
  return {
    includedCourseCount: included.length,
    excludedCourseCount: parsed.courses.length - included.length,
    totalIncludedCredits: totalCredits.toFixed(),
    totalQualityPoints: totalQualityPoints.toFixed(),
    exactGpa: gpa.exact,
    roundedGpa: gpa.rounded,
    gradePointScale: scale.toFixed(),
    rounding: roundingMetadata(rounding),
  };
}
