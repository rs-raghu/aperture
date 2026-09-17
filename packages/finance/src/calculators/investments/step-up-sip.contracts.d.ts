import type { CashFlowTiming, DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface StepUpSipInput extends CalculatorInputContext {
  readonly initialContribution: Money;
  readonly stepUpRate: Percentage;
  readonly expectedReturn: InterestRate;
  readonly contributionCount: number;
  readonly contributionTiming: CashFlowTiming;
}

export interface StepUpSipResult {
  readonly investedAmount: Money;
  readonly estimatedValue: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rates and contribution timing are explicit. Output separates contributions and estimated value. */
export declare function calculateStepUpSip(input: StepUpSipInput): StepUpSipResult;
