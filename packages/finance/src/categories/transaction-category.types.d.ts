import type { FinancialMetadata, FinancialStatus } from "../finance.types.js";

export type TransactionCategoryId = string;
export type TransactionCategoryKind = "income" | "expense" | "transfer";

export interface TransactionCategory extends FinancialMetadata {
  readonly id: TransactionCategoryId;
  readonly name: string;
  readonly kind: TransactionCategoryKind;
  readonly systemCategory: boolean;
  readonly status: FinancialStatus;
}
