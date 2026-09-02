export type HealthErrorCode =
  | "not_found"
  | "conflict"
  | "invalid_state"
  | "unsupported_operation";

export interface HealthDomainError {
  readonly code: HealthErrorCode;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}
