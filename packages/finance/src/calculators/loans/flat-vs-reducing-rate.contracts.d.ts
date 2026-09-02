import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface FlatVsReducingRateInput extends CalculatorInputContext {
  readonly principal: Money;
  readonly flatRate: InterestRate;
  readonly reducingRate: InterestRate;
  readonly paymentCount: number;
}

export interface FlatVsReducingRateResult {
  readonly estimatedFlatTotal: Money;
  readonly estimatedReducingTotal: Money;
  readonly estimatedDifference: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rates use human percentages. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function compareFlatAndReducingRate(input: FlatVsReducingRateInput): FlatVsReducingRateResult;
