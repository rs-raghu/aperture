import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface DatedCashFlow { readonly date: IsoDate; readonly amount: Money; }

export interface XirrInput extends CalculatorInputContext {
  readonly cashFlows: readonly DatedCashFlow[];
}

export interface XirrResult {
  readonly annualizedRate: Percentage;
  readonly metadata: CalculatorResultMetadata;
}

/** Cash-flow money retains currency, dates are ISO strings, and the estimated output includes explicit metadata. */
export declare function calculateXirr(input: XirrInput): XirrResult;
