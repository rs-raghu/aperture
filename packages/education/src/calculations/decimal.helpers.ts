import { Decimal } from "decimal.js";
import { validateInput } from "@aperture/validation";

import { EducationCalculationError } from "./calculation.errors.js";
import type {
  CalculationRoundingMetadata,
  RoundedDecimalResult,
  RoundingMode,
  RoundingOptions,
} from "./calculation.types.js";
import type { ValidationSchema } from "@aperture/validation";

const decimalRoundingModes: Readonly<Record<RoundingMode, Decimal.Rounding>> = {
  "half-up": Decimal.ROUND_HALF_UP,
  "half-even": Decimal.ROUND_HALF_EVEN,
  down: Decimal.ROUND_DOWN,
  up: Decimal.ROUND_UP,
};

export function parseCalculationInput<Output>(
  schema: ValidationSchema<Output>,
  input: unknown,
): Output {
  const result = validateInput(schema, input);
  if (result.success) {
    return result.value;
  }

  throw new EducationCalculationError(
    "invalid-calculation-input",
    result.issues.map((issue) => issue.message).join("; "),
    result.issues,
  );
}

export function decimal(value: string): Decimal {
  try {
    return new Decimal(value);
  } catch {
    throw new EducationCalculationError(
      "calculation-failed",
      "A validated decimal value could not be processed.",
    );
  }
}

export function exactDecimal(value: Decimal): string {
  if (!value.isFinite()) {
    throw new EducationCalculationError(
      "calculation-failed",
      "The calculation did not produce a finite result.",
    );
  }

  return value.toFixed();
}

export function roundedDecimal(
  value: Decimal,
  rounding: RoundingOptions,
): RoundedDecimalResult {
  return {
    exact: exactDecimal(value),
    rounded: value.toDecimalPlaces(
      rounding.decimalPlaces,
      decimalRoundingModes[rounding.mode],
    ).toFixed(rounding.decimalPlaces),
  };
}

export function roundingMetadata(
  rounding: RoundingOptions,
): CalculationRoundingMetadata {
  return { decimalPlaces: rounding.decimalPlaces, mode: rounding.mode };
}

export function calculationIssue(
  path: readonly (string | number)[],
  message: string,
): never {
  const issue = { code: "custom", message, path } as const;
  throw new EducationCalculationError(
    "invalid-calculation-input",
    message,
    [issue],
  );
}
