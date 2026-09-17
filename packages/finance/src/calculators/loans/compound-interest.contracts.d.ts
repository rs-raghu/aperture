import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface CompoundInterestInput extends CalculatorInputContext {
  readonly principal: Money;
  readonly interestRate: InterestRate;
  readonly periodCount: number;
  readonly compoundingCount: number;
}

export interface CompoundInterestResult {
  readonly estimatedInterest: Money;
  readonly estimatedTotal: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; the plug-in implements discrete compounding from caller-supplied assumptions and reports an estimate with disclosures. */
export declare function calculateCompoundInterest(input: CompoundInterestInput): CompoundInterestResult;
