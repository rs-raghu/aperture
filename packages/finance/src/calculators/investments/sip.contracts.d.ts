import type { CashFlowTiming, DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface SipInput extends CalculatorInputContext {
  readonly periodicContribution: Money;
  readonly expectedReturn: InterestRate;
  readonly contributionCount: number;
  readonly contributionTiming: CashFlowTiming;
}

export interface SipResult {
  readonly investedAmount: Money;
  readonly estimatedValue: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rate and contribution timing are explicit. Output separates contributions and estimated value. */
export declare function calculateSip(input: SipInput): SipResult;
