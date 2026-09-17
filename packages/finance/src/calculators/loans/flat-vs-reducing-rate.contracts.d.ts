import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface FlatVsReducingRateInput extends CalculatorInputContext {
  readonly principal: Money;
  readonly flatRate: InterestRate;
  readonly flatRateKind: "nominal" | "effective";
  readonly reducingRate: InterestRate;
  readonly reducingRateKind: "nominal" | "effective";
  readonly paymentCount: number;
}

export interface FlatVsReducingRateResult {
  readonly estimatedFlatTotal: Money;
  readonly estimatedReducingTotal: Money;
  readonly estimatedDifference: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; the plug-in compares disclosed flat and reducing annual-rate conventions over the same monthly term. */
export declare function compareFlatAndReducingRate(input: FlatVsReducingRateInput): FlatVsReducingRateResult;
