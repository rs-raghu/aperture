import type { DecimalString, IsoDate } from "../../finance.types.js";
import type { InterestRate } from "../../interest-rate.types.js";
import type { Money } from "../../money.types.js";
import type { Percentage } from "../../percentage.types.js";
import type { CalculatorInputContext, CalculatorResultMetadata } from "../calculator.types.js";

export interface PostOfficeMisInput extends CalculatorInputContext {
  readonly deposit: Money;
  readonly assumedRate: InterestRate;
  readonly paymentCount: number;
}

export interface PostOfficeMisResult {
  readonly estimatedPeriodicIncome: Money;
  readonly metadata: CalculatorResultMetadata;
}

/** Money retains currency; rate uses a required human percentage. Output is an estimate with explicit metadata. */
export declare function calculatePostOfficeMis(input: PostOfficeMisInput): PostOfficeMisResult;
