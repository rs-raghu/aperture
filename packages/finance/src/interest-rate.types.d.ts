import type { DecimalString, FinancialPeriod } from "./finance.types.js";

/** Human percentage string: `"8.5"` means an 8.5% rate. */
export type InterestRateValue = DecimalString;

export interface InterestRate {
  readonly value: InterestRateValue;
  readonly representation: "human_percentage";
  readonly period: FinancialPeriod;
}
