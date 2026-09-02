import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface GratuityInput extends CalculatorInputContext {
  readonly eligibleSalary: Money;
  readonly yearsOfService: number;
  readonly benefitFactor: Percentage;
}

export interface GratuityResult {
  readonly estimatedBenefit: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; factor is a human percentage; years are integral. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateGratuity(input: GratuityInput): GratuityResult;
