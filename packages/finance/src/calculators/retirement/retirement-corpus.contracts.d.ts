import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface RetirementCorpusInput extends CalculatorInputContext {
  readonly currentSavings: Money;
  readonly desiredAnnualIncome: Money;
  readonly expectedReturn: InterestRate;
  readonly inflationRate: Percentage;
  readonly years: number;
}

export interface RetirementCorpusResult {
  readonly estimatedCorpus: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money inputs and output retain currency; rates use human percentages. Output is an estimate. Version, assumptions, and sources are placeholders. No formula is implemented in Phase 3. */
export declare function calculateRetirementCorpus(input: RetirementCorpusInput): RetirementCorpusResult;
