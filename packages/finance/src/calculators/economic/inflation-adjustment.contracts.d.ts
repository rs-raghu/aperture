import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface InflationAdjustedValueInput extends CalculatorInputContext {
  readonly presentValue: Money;
  readonly inflationRate: Percentage;
  readonly periodCount: number;
}

export interface InflationAdjustedValueResult {
  readonly estimatedAdjustedValue: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; inflation uses a human percentage; count is integral. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateInflationAdjustedValue(input: InflationAdjustedValueInput): InflationAdjustedValueResult;
