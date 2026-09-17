import type { CashFlowTiming, DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface NpsInput extends CalculatorInputContext {
  readonly currentBalance: Money;
  readonly contribution: Money;
  readonly employerContribution: Money;
  readonly expectedReturn: InterestRate;
  readonly contributionCount: number;
  readonly contributionTiming: CashFlowTiming;
  readonly annuityAllocation: Percentage;
  readonly assumedAnnuityRate: Percentage;
  readonly ruleVersion: string;
  readonly ruleEffectiveOn: IsoDate;
}

export interface NpsResult {
  readonly estimatedCorpus: Money;
  readonly totalEmployeeContributions: Money;
  readonly totalEmployerContributions: Money;
  readonly estimatedAnnuityPurchase: Money;
  readonly estimatedLumpSum: Money;
  readonly estimatedAnnualPension: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** The plug-in projects NPS values from explicit contributions, allocation, rates, and effective-dated caller rules. */
export declare function calculateNps(input: NpsInput): NpsResult;
