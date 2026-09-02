import type { CurrencyCode, FinancialMetadata, FinancialPeriod, FinancialStatus, IsoDate } from "../finance.types.js";

export type BudgetId = string;

export interface Budget extends FinancialMetadata {
  readonly id: BudgetId;
  readonly name: string;
  readonly currency: CurrencyCode;
  readonly period: FinancialPeriod;
  readonly startsOn: IsoDate;
  readonly endsOn: IsoDate;
  readonly status: FinancialStatus;
}
