import type { ValidationIssue } from "@aperture/validation";

export type HealthCalculationErrorCode =
  | "invalid-calculation-input"
  | "invalid-calculation-result"
  | "calculation-failed";

export class HealthCalculationError extends Error {
  public readonly name = "HealthCalculationError";

  public constructor(
    public readonly code: HealthCalculationErrorCode,
    message: string,
    public readonly issues: readonly ValidationIssue[] = [],
  ) {
    super(message);
  }
}
