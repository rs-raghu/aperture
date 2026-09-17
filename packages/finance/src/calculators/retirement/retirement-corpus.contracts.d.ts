import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";
import type { RetirementProjectionScenario, RetirementScenarioResult } from "./retirement-scenario.contracts.js";

export interface RetirementCorpusInput extends CalculatorInputContext {
  readonly currentSavings: Money;
  readonly annualContribution: Money;
  readonly contributionTiming: "beginning_of_period" | "end_of_period";
  readonly desiredAnnualIncome: Money;
  readonly currentAge: number;
  readonly retirementAge: number;
  readonly longevityAge: number;
  readonly scenarios: readonly RetirementProjectionScenario[];
}

export interface RetirementCorpusResult {
  readonly estimatedCorpus: Money;
  readonly projectedSavings: Money;
  readonly fundingGap: Money;
  readonly scenarios: readonly RetirementScenarioResult[];
  readonly metadata: CalculatorResultMetadata;
}

/** The plug-in compares caller-supplied retirement-income scenarios and exposes every material assumption. */
export declare function calculateRetirementCorpus(input: RetirementCorpusInput): RetirementCorpusResult;
