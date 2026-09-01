import type { WeightedGradeComponentInput } from "./weighted-grade.contracts.js";

export interface PlannedGradeComponentInput {
  readonly expectedScore: number;
  readonly maximumScore: number;
  /** Contribution to the course grade, expressed as a percentage from 0 to 100. */
  readonly weightPercentage: number;
}

export interface GradeProjectionInput {
  readonly completedComponents: readonly WeightedGradeComponentInput[];
  readonly plannedComponents: readonly PlannedGradeComponentInput[];
}

export interface GradeProjectionResult {
  /** Projected final course grade expressed as a percentage from 0 to 100. */
  readonly projectedPercentage: number;
  readonly representedWeightPercentage: number;
}

export declare function projectCourseGrade(input: GradeProjectionInput): GradeProjectionResult;
