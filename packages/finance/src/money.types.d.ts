import type { CurrencyCode, DecimalString } from "./finance.types.js";

export type MoneyAmount = DecimalString;

export interface Money {
  /** Decimal monetary amount represented as a base-10 string. */
  readonly amount: MoneyAmount;
  readonly currency: CurrencyCode;
}
