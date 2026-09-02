import type { CurrencyCode, FinancialMetadata, FinancialStatus } from "../finance.types.js";

export type TaxProfileId = string;

export interface TaxProfile extends FinancialMetadata {
  readonly id: TaxProfileId;
  readonly jurisdiction: string;
  readonly currency: CurrencyCode;
  readonly status: FinancialStatus;
}
