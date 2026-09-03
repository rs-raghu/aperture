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

export type ValidationResult<Value> = ValidationSuccess<Value> | ValidationFailure;

export interface ValidationSchema<Input, Output> {
  readonly name: string;
  readonly inputType?: Input;
  readonly outputType?: Output;
}
