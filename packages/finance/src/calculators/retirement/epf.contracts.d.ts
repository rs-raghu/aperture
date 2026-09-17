import type { CashFlowTiming, DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface EpfInput extends CalculatorInputContext {
  readonly currentBalance: Money;
  readonly periodicContribution: Money;
  readonly employerContribution: Money;
  readonly expectedRate: InterestRate;
  readonly contributionCount: number;
  readonly contributionTiming: CashFlowTiming;
  readonly ruleVersion: string;
  readonly ruleEffectiveOn: IsoDate;
}

export interface EpfResult {
  readonly estimatedBalance: Money;
  readonly totalEmployeeContributions: Money;
  readonly totalEmployerContributions: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** The plug-in projects EPF from separate employee and employer contributions and an effective-dated caller rule. */
export declare function calculateEpf(input: EpfInput): EpfResult;
