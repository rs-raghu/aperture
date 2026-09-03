import { z } from "@aperture/validation";

export const roundingModes = ["half-up", "half-even", "down", "up"] as const;
export const roundingModeSchema = z.enum(roundingModes);
export type RoundingMode = z.infer<typeof roundingModeSchema>;

export const roundingOptionsSchema = z.strictObject({
  decimalPlaces: z.number().int().min(0).max(12).optional(),
  mode: roundingModeSchema.optional(),
});
export type CalculationRoundingInput = z.infer<typeof roundingOptionsSchema>;

export const optionalRoundingOptionsSchema = roundingOptionsSchema.optional();

export interface RoundingOptions {
  readonly decimalPlaces: number;
  readonly mode: RoundingMode;
}

export function resolveRoundingOptions(
  input: CalculationRoundingInput | undefined,
): RoundingOptions {
  return {
    decimalPlaces: input?.decimalPlaces ?? 2,
    mode: input?.mode ?? "half-up",
  };
}

export interface RoundedDecimalResult {
  readonly exact: string;
  readonly rounded: string;
}

export interface CalculationRoundingMetadata {
  readonly decimalPlaces: number;
  readonly mode: RoundingMode;
}

export type CalculationWarningCode =
  | "partial-weight"
  | "weight-above-100"
  | "extra-credit"
  | "incomplete-projection-assumptions";
