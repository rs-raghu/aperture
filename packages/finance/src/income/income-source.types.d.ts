import type { FinancialFrequency, FinancialMetadata, FinancialStatus } from "../finance.types.js";
import type { Money } from "../money.types.js";

export type IncomeSourceId = string;

export interface IncomeSource extends FinancialMetadata {
  readonly id: IncomeSourceId;
  readonly name: string;
  readonly expectedAmount?: Money;
  readonly frequency?: FinancialFrequency;
  readonly status: FinancialStatus;
}
