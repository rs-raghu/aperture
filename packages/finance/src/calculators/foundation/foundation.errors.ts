import type { ValidationIssue } from "@aperture/validation";

export type FinanceCalculationErrorCode =
  | "invalid-calculation-input"
  | "invalid-calculation-result"
  | "currency-mismatch"
  | "unsupported-rate-convention"
  | "non-convergent"
  | "calculation-failed";

export class FinanceCalculationError extends Error {
  public readonly name = "FinanceCalculationError";

  public constructor(
    public readonly code: FinanceCalculationErrorCode,
    message: string,
    public readonly issues: readonly ValidationIssue[] = [],
  ) {
    super(message);
  }
}
