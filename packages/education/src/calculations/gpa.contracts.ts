import type { CourseId } from "../courses/course.types.js";

export interface GpaCourseInput {
  readonly courseId?: CourseId;
  readonly gradePoints: number;
  readonly creditUnits: number;
}

export interface GpaCalculationInput {
  readonly courses: readonly GpaCourseInput[];
  /** Maximum grade-point value on the institution's GPA scale. */
  readonly scaleMaximum: number;
}

export interface GpaCalculationResult {
  readonly gpa: number;
  readonly earnedCreditUnits: number;
  readonly scaleMaximum: number;
}

export declare function calculateGpa(input: GpaCalculationInput): GpaCalculationResult;
