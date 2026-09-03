import type { ValidationIssue } from "@aperture/validation";

export type EducationCalculationErrorCode =
  | "invalid-calculation-input"
  | "calculation-failed";

export class EducationCalculationError extends Error {
  public readonly name = "EducationCalculationError";

  public constructor(
    public readonly code: EducationCalculationErrorCode,
    message: string,
    public readonly issues: readonly ValidationIssue[] = [],
  ) {
    super(message);
  }
}
