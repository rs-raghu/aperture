import type { SemesterId } from "../semesters/semester.types.js";

export interface CgpaSemesterInput {
  readonly semesterId?: SemesterId;
  readonly gpa: number;
  readonly creditUnits: number;
}

export interface CgpaCalculationInput {
  readonly semesters: readonly CgpaSemesterInput[];
  /** Maximum grade-point value on the cumulative GPA scale. */
  readonly scaleMaximum: number;
}

export interface CgpaCalculationResult {
  readonly cgpa: number;
  readonly totalCreditUnits: number;
  readonly scaleMaximum: number;
}

export declare function calculateCgpa(input: CgpaCalculationInput): CgpaCalculationResult;
