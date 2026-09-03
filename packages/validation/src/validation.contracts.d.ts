import type { NormalizedValidationError } from "./validation.errors.js";
import type {
  ValidationFailure,
  ValidationResult,
  ValidationSchema,
  ValidationSuccess
} from "./validation.types.js";

export declare function validateInput<Input, Output>(
  schema: ValidationSchema<Input, Output>,
  input: Input
): ValidationResult<Output>;
export declare function validateOutput<Input, Output>(
  schema: ValidationSchema<Input, Output>,
  output: Output
): ValidationResult<Output>;
export declare function normalizeValidationError(error: unknown): NormalizedValidationError;
export declare function isValidationSuccess<Value>(
  result: ValidationResult<Value>
): result is ValidationSuccess<Value>;
export declare function isValidationFailure<Value>(
  result: ValidationResult<Value>
): result is ValidationFailure;
