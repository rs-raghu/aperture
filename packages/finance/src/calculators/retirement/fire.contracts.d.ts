import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface FireInput extends CalculatorInputContext {
  readonly annualExpenses: Money;
  readonly withdrawalRate: Percentage;
}

export interface FireResult {
  readonly targetCorpus: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money inputs retain currency; percentage inputs use human percentages. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateFire(input: FireInput): FireResult;
