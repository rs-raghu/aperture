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

/** Money retains currency; rate uses a human percentage. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateSimpleInterest(input: SimpleInterestInput): SimpleInterestResult;
