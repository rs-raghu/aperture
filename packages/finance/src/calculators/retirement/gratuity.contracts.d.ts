import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface GratuityInput extends CalculatorInputContext {
  readonly eligibleSalary: Money;
  readonly yearsOfService: number;
  readonly benefitFactor: Percentage;
  readonly ruleVersion: string;
  readonly ruleEffectiveOn: IsoDate;
}

export interface GratuityResult {
  readonly estimatedBenefit: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** The plug-in estimates gratuity using an explicit benefit factor and effective-dated caller rule. */
export declare function calculateGratuity(input: GratuityInput): GratuityResult;
