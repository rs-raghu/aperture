import { z } from "zod";

import type { NormalizedValidationError } from "./validation.errors.js";
import type {
  ValidationFailure,
  ValidationIssue,
  ValidationResult,
  ValidationSchema,
  ValidationSuccess,
} from "./validation.types.js";

function toValidationIssue(issue: z.ZodIssue): ValidationIssue {
  return {
    code: issue.code,
    message: issue.message,
    path: issue.path,
  };
}

function issuesFromError(error: unknown): readonly ValidationIssue[] {
  if (error instanceof z.ZodError) {
    return error.issues.map(toValidationIssue);
  }

  const message =
    error instanceof Error && error.message.trim().length > 0
      ? error.message
      : "Validation failed.";

  return [{ code: "unknown", message, path: [] }];
}

export function validateInput<Output>(
  schema: ValidationSchema<Output>,
  input: unknown,
): ValidationResult<Output> {
  const result = schema.safeParse(input);

  return result.success
    ? { success: true, value: result.data }
    : { success: false, issues: result.error.issues.map(toValidationIssue) };
}

export function validateOutput<Output>(
  schema: ValidationSchema<Output>,
  output: unknown,
): ValidationResult<Output> {
  return validateInput(schema, output);
}

export function normalizeValidationError(error: unknown): NormalizedValidationError {
  const issues = issuesFromError(error);

  return {
    name: "ValidationError",
    message: issues.map((issue) => issue.message).join("; "),
    issues,
  };
}

export function isValidationSuccess<Value>(
  result: ValidationResult<Value>,
): result is ValidationSuccess<Value> {
  return result.success;
}

export function isValidationFailure<Value>(
  result: ValidationResult<Value>,
): result is ValidationFailure {
  return !result.success;
}
