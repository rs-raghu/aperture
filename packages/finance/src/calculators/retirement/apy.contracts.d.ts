import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface ApyInput extends CalculatorInputContext {
  readonly periodicContribution: Money;
  readonly contributionCount: number;
  readonly assumedRate: InterestRate;
}

export interface ApyResult {
  readonly estimatedPensionValue: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rate uses a human percentage; count is integral. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateApy(input: ApyInput): ApyResult;
