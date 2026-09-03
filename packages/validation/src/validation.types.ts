import type { z } from "zod";

export interface ValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly path: readonly (string | number)[];
}

export interface ValidationSuccess<Value> {
  readonly success: true;
  readonly value: Value;
}

export interface ValidationFailure {
  readonly success: false;
  readonly issues: readonly ValidationIssue[];
}

export type ValidationResult<Value> =
  | ValidationSuccess<Value>
  | ValidationFailure;

export type ValidationSchema<Output> = z.ZodType<Output>;
