import type { CashFlowTiming, DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface ApyInput extends CalculatorInputContext {
  readonly currentBalance: Money;
  readonly periodicContribution: Money;
  readonly contributionCount: number;
  readonly assumedRate: InterestRate;
  readonly contributionTiming: CashFlowTiming;
  readonly ruleVersion: string;
  readonly ruleEffectiveOn: IsoDate;
}

export interface ApyResult {
  readonly estimatedPensionValue: Money;
  readonly totalContributions: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** The plug-in projects APY value from a supplied contribution schedule, rate, and effective-dated caller rule. */
export declare function calculateApy(input: ApyInput): ApyResult;
