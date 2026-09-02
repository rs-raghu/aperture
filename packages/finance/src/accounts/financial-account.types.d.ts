import type { CurrencyCode, FinancialMetadata, FinancialStatus } from "../finance.types.js";

export type FinancialAccountId = string;
export type FinancialAccountType = "cash" | "bank" | "credit_card" | "loan" | "investment" | "retirement" | "fixed_deposit" | "other";

export interface FinancialAccount extends FinancialMetadata {
  readonly id: FinancialAccountId;
  readonly name: string;
  readonly accountType: FinancialAccountType;
  readonly currency: CurrencyCode;
  readonly status: FinancialStatus;
}
