import type { CurrencyCode, FinancialMetadata, FinancialStatus } from "../finance.types.js";
import type { FinancialAccountId } from "../accounts/financial-account.types.js";

export type InvestmentAccountId = string;

export interface InvestmentAccount extends FinancialMetadata {
  readonly id: InvestmentAccountId;
  readonly financialAccountId?: FinancialAccountId;
  readonly name: string;
  readonly currency: CurrencyCode;
  readonly status: FinancialStatus;
}
