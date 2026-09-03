import { Decimal } from "decimal.js";
import { z } from "@aperture/validation";

import { semesterIdSchema } from "../semesters/semester.types.js";
import { calculationDecimalSchema, positiveCalculationDecimalSchema } from "./calculation.schemas.js";
import { optionalRoundingOptionsSchema, resolveRoundingOptions } from "./calculation.types.js";
import { calculationIssue, decimal, parseCalculationInput, roundedDecimal, roundingMetadata } from "./decimal.helpers.js";

export const cgpaSemesterInputSchema = z.strictObject({
  semesterId: semesterIdSchema,
  gpa: calculationDecimalSchema,
  credits: calculationDecimalSchema,
  included: z.boolean().default(true),
});
export type CgpaSemesterInput = z.input<typeof cgpaSemesterInputSchema>;

export const cgpaCalculationInputSchema = z.strictObject({
  semesters: z.array(cgpaSemesterInputSchema).min(1),
  gradePointScale: positiveCalculationDecimalSchema,
  rounding: optionalRoundingOptionsSchema,
});
export type CgpaCalculationInput = z.input<typeof cgpaCalculationInputSchema>;

export interface CgpaCalculationResult {
  readonly includedSemesterCount: number;
  readonly excludedSemesterCount: number;
  readonly totalCredits: string;
  readonly totalWeightedGradePoints: string;
  readonly exactCgpa: string;
  readonly roundedCgpa: string;
  readonly gradePointScale: string;
  readonly rounding: ReturnType<typeof roundingMetadata>;
}

export const cgpaCalculationResultSchema = z.strictObject({
  includedSemesterCount: z.number().int().nonnegative(),
  excludedSemesterCount: z.number().int().nonnegative(),
  totalCredits: calculationDecimalSchema,
  totalWeightedGradePoints: calculationDecimalSchema,
  exactCgpa: calculationDecimalSchema,
  roundedCgpa: calculationDecimalSchema,
  gradePointScale: positiveCalculationDecimalSchema,
  rounding: z.strictObject({ decimalPlaces: z.number().int().min(0).max(12), mode: z.enum(["half-up", "half-even", "down", "up"]) }),
});

export function calculateCgpa(input: CgpaCalculationInput): CgpaCalculationResult {
  const parsed = parseCalculationInput(cgpaCalculationInputSchema, input);
  const rounding = resolveRoundingOptions(parsed.rounding);
  const scale = decimal(parsed.gradePointScale);
  for (const [index, semester] of parsed.semesters.entries()) {
    if (decimal(semester.gpa).greaterThan(scale)) calculationIssue(["semesters", index, "gpa"], "Semester GPA cannot exceed the configured scale.");
  }
  const included = parsed.semesters.filter((semester) => semester.included);
  if (included.length === 0) calculationIssue(["semesters"], "At least one semester must be included.");

  let totalCredits = new Decimal(0);
  let weighted = new Decimal(0);
  for (const [index, semester] of parsed.semesters.entries()) {
    if (!semester.included) continue;
    const gpa = decimal(semester.gpa);
    const credits = decimal(semester.credits);
    totalCredits = totalCredits.plus(credits);
    weighted = weighted.plus(gpa.times(credits));
  }

  if (totalCredits.isZero()) calculationIssue(["semesters"], "Total included semester credits must be greater than zero.");
  const cgpa = roundedDecimal(weighted.dividedBy(totalCredits), rounding);
  return {
    includedSemesterCount: included.length,
    excludedSemesterCount: parsed.semesters.length - included.length,
    totalCredits: totalCredits.toFixed(),
    totalWeightedGradePoints: weighted.toFixed(),
    exactCgpa: cgpa.exact,
    roundedCgpa: cgpa.rounded,
    gradePointScale: scale.toFixed(),
    rounding: roundingMetadata(rounding),
  };
}
