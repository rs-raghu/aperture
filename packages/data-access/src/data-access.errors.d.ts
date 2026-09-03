export type DataAccessErrorCode =
  | "conflict"
  | "forbidden"
  | "invalid-query"
  | "not-found"
  | "transaction"
  | "unavailable"
  | "unknown";

export interface DataAccessError {
  readonly code: DataAccessErrorCode;
  readonly message: string;
  readonly cause?: unknown;
}
