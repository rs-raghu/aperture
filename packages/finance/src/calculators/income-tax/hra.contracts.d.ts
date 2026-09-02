import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface HraInput extends CalculatorInputContext {
  readonly basicSalary: Money;
  readonly hraReceived: Money;
  readonly rentPaid: Money;
  readonly locationCategory: string;
}

export interface HraResult {
  readonly estimatedExemption: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; location identifies external rule context. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateHra(input: HraInput): HraResult;
