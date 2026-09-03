import type { ValidationIssue } from "./validation.types.js";

export interface NormalizedValidationError {
  readonly name: "ValidationError";
  readonly message: string;
  readonly issues: readonly ValidationIssue[];
}
