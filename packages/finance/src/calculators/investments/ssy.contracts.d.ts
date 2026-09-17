import type { CashFlowTiming, DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface SsyInput extends CalculatorInputContext {
  readonly contribution: Money;
  readonly assumedRate: InterestRate;
  readonly periodCount: number;
  readonly contributionTiming: CashFlowTiming;
}

export interface SsyResult {
  readonly estimatedMaturityValue: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rate and timing are explicit. Output is an estimate with explicit metadata. */
export declare function calculateSsy(input: SsyInput): SsyResult;
