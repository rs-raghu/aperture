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
  readonly salaryRate: Percentage;
  readonly rentOffsetRate: Percentage;
  readonly ruleVersion: string;
  readonly ruleEffectiveOn: IsoDate;
}

export interface HraResult {
  readonly estimatedExemption: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; the plug-in evaluates caller-supplied, effective-dated HRA percentages and reports an estimate. */
export declare function calculateHra(input: HraInput): HraResult;
