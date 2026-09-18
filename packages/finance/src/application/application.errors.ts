export type FinanceApplicationErrorCode =
  | "finance-invalid-input"
  | "finance-not-found"
  | "finance-conflict"
  | "finance-owner-mismatch"
  | "finance-invalid-state-transition"
  | "finance-relationship-invalid"
  | "finance-calculator-not-found"
  | "finance-repository-contract-violation";

export class FinanceApplicationError extends Error {
  public readonly code: FinanceApplicationErrorCode;
  public readonly details: Readonly<Record<string, unknown>>;

  public constructor(code: FinanceApplicationErrorCode, message: string, details: Readonly<Record<string, unknown>> = {}) {
    super(message);
    this.name = "FinanceApplicationError";
    this.code = code;
    this.details = details;
  }
}
