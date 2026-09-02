import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface SwpInput extends CalculatorInputContext {
  readonly initialInvestment: Money;
  readonly periodicWithdrawal: Money;
  readonly expectedReturn: InterestRate;
  readonly withdrawalCount: number;
}

export interface SwpResult {
  readonly estimatedEndingValue: Money;
  readonly totalWithdrawals: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rate uses a human percentage. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateSwp(input: SwpInput): SwpResult;
