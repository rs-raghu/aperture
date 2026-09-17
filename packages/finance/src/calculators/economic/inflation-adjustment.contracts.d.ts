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

/** Money retains currency; the plug-in applies the supplied inflation assumption across an integral year count. */
export declare function calculateInflationAdjustedValue(input: InflationAdjustedValueInput): InflationAdjustedValueResult;
