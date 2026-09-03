import type { ValidationIssue } from "./validation.types.js";

export interface NormalizedValidationError {
  readonly name: "ValidationError";
  readonly issues: readonly ValidationIssue[];
  readonly cause?: unknown;
}
