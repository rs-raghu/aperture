export type EducationErrorCode =
  | "not_found"
  | "conflict"
  | "invalid_state"
  | "operation_not_supported";

export interface EducationDomainError {
  readonly name: "EducationDomainError";
  readonly code: EducationErrorCode;
  readonly message: string;
  readonly details?: Readonly<Record<string, string | number | boolean | null>>;
}
