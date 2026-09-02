export type FinanceErrorCode = "not_found" | "conflict" | "invalid_state" | "unsupported_operation";

export interface FinanceDomainError {
  readonly code: FinanceErrorCode;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}
