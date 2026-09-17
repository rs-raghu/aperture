import type { CashFlowTiming, DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface RdInput extends CalculatorInputContext {
  readonly periodicContribution: Money;
  readonly assumedRate: InterestRate;
  readonly contributionCount: number;
  readonly contributionTiming: CashFlowTiming;
}

export interface RdResult {
  readonly estimatedMaturityValue: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rate and timing are explicit. Output is an estimate with explicit metadata. */
export declare function calculateRd(input: RdInput): RdResult;
