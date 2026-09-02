import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface NpsInput extends CalculatorInputContext {
  readonly contribution: Money;
  readonly expectedReturn: InterestRate;
  readonly contributionCount: number;
}

export interface NpsResult {
  readonly estimatedCorpus: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rates use human percentages; count is integral. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateNps(input: NpsInput): NpsResult;
