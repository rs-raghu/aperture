import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface PpfInput extends CalculatorInputContext {
  readonly contribution: Money;
  readonly assumedRate: InterestRate;
  readonly periodCount: number;
}

export interface PpfResult {
  readonly estimatedMaturityValue: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rate uses a human percentage. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculatePpf(input: PpfInput): PpfResult;
