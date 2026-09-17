import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface MutualFundReturnsInput extends CalculatorInputContext {
  readonly investedAmount: Money;
  readonly currentValue: Money;
}

export interface MutualFundReturnsResult {
  readonly absoluteReturn: Money;
  readonly returnPercentage: Percentage;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; percentage output uses the human-percentage convention and explicit metadata. */
export declare function calculateMutualFundReturns(input: MutualFundReturnsInput): MutualFundReturnsResult;
