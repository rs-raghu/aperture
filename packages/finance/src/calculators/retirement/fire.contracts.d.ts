import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";
import type { RetirementProjectionScenario, RetirementScenarioResult } from "./retirement-scenario.contracts.js";

export interface FireInput extends CalculatorInputContext {
  readonly annualExpenses: Money;
  readonly currentAge: number;
  readonly retirementAge: number;
  readonly longevityAge: number;
  readonly existingCorpus: Money;
  readonly annualContribution: Money;
  readonly contributionTiming: "beginning_of_period" | "end_of_period";
  readonly scenarios: readonly RetirementProjectionScenario[];
}

export interface FireResult {
  readonly targetCorpus: Money;
  readonly inflationAdjustedAnnualExpenses: Money;
  readonly projectedCorpus: Money;
  readonly fundingGap: Money;
  readonly scenarios: readonly RetirementScenarioResult[];
  readonly metadata: CalculatorResultMetadata;
}

/** The plug-in compares caller-supplied FIRE scenarios without making a guarantee or personalized recommendation. */
export declare function calculateFire(input: FireInput): FireResult;
