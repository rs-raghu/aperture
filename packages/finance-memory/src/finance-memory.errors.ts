export type FinanceMemoryRepositoryErrorCode =
  | "finance-memory-duplicate-id"
  | "finance-memory-record-not-found"
  | "finance-memory-immutable-identity"
  | "finance-memory-invalid-query"
  | "finance-memory-invalid-entity";

export class FinanceMemoryRepositoryError extends Error {
  public constructor(
    public readonly code: FinanceMemoryRepositoryErrorCode,
    message: string,
    public readonly details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "FinanceMemoryRepositoryError";
  }
}
