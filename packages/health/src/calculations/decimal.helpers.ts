import { Decimal } from "decimal.js";
import { validateInput } from "@aperture/validation";

import { HealthCalculationError } from "./calculation.errors.js";
import type { ValidationSchema } from "@aperture/validation";

export const HEALTH_CALCULATION_DECIMAL_PLACES = 12;

export function parseCalculationInput<Output>(
  schema: ValidationSchema<Output>,
  input: unknown,
): Output {
  const result = validateInput(schema, input);
  if (result.success) return result.value;

  throw new HealthCalculationError(
    "invalid-calculation-input",
    result.issues.map((issue) => issue.message).join("; "),
    result.issues,
  );
}

export function parseCalculationResult<Output>(
  schema: ValidationSchema<unknown>,
  output: Output,
): Output {
  const result = validateInput(schema, output);
  if (result.success) return output;

  throw new HealthCalculationError(
    "invalid-calculation-result",
    "The calculation produced an invalid result.",
    result.issues,
  );
}

export function decimal(value: string | number): Decimal {
  try {
    return new Decimal(value);
  } catch {
    throw new HealthCalculationError(
      "calculation-failed",
      "A validated numeric value could not be processed.",
    );
  }
}

export function calculationDecimal(value: Decimal): string {
  if (!value.isFinite()) {
    throw new HealthCalculationError(
      "calculation-failed",
      "The calculation did not produce a finite result.",
    );
  }

  return value
    .toDecimalPlaces(HEALTH_CALCULATION_DECIMAL_PLACES, Decimal.ROUND_HALF_UP)
    .toFixed();
}

export function calculationNumber(value: Decimal, decimalPlaces = 2): number {
  if (!value.isFinite()) {
    throw new HealthCalculationError(
      "calculation-failed",
      "The calculation did not produce a finite result.",
    );
  }

  return value.toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP).toNumber();
}

export function calculationIssue(
  path: readonly (string | number)[],
  message: string,
): never {
  const issue = { code: "custom", message, path } as const;
  throw new HealthCalculationError(
    "invalid-calculation-input",
    message,
    [issue],
  );
}
