import type { CashFlowTiming, DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface SwpInput extends CalculatorInputContext {
  readonly initialInvestment: Money;
  readonly periodicWithdrawal: Money;
  readonly expectedReturn: InterestRate;
  readonly withdrawalCount: number;
  readonly withdrawalTiming: CashFlowTiming;
}

export interface SwpResult {
  readonly estimatedEndingValue: Money;
  readonly totalWithdrawals: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rate and withdrawal timing are explicit. Output separates withdrawals and estimated value. */
export declare function calculateSwp(input: SwpInput): SwpResult;
