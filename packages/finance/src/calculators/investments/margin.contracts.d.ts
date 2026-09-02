import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface MarginInput extends CalculatorInputContext {
  readonly positionValue: Money;
  readonly contributedCapital: Money;
}

export interface MarginResult {
  readonly borrowedAmount: Money;
  readonly marginPercentage: Percentage;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; percentage output uses the human-percentage convention. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateMargin(input: MarginInput): MarginResult;
