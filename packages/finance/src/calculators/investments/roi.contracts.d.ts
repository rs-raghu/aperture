import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface RoiInput extends CalculatorInputContext {
  readonly initialValue: Money;
  readonly finalValue: Money;
}

export interface RoiResult {
  readonly returnAmount: Money;
  readonly returnPercentage: Percentage;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; percentage output uses the human-percentage convention. Output is not an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateRoi(input: RoiInput): RoiResult;
