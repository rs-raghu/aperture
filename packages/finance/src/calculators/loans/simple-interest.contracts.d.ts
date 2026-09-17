import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface SimpleInterestInput extends CalculatorInputContext {
  readonly principal: Money;
  readonly interestRate: InterestRate;
  readonly periodCount: number;
}

export interface SimpleInterestResult {
  readonly estimatedInterest: Money;
  readonly estimatedTotal: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; the plug-in implements simple interest from caller-supplied assumptions and reports an estimate with disclosures. */
export declare function calculateSimpleInterest(input: SimpleInterestInput): SimpleInterestResult;
