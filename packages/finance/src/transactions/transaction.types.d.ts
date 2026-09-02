import type { FinancialMetadata, FinancialStatus, IsoDateTime } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { FinancialAccountId } from "../accounts/financial-account.types.js";
import type { TransactionCategoryId } from "../categories/transaction-category.types.js";

export type TransactionId = string;
export type TransactionType = "income" | "expense" | "transfer";

export interface Transaction extends FinancialMetadata {
  readonly id: TransactionId;
  readonly accountId: FinancialAccountId;
  readonly categoryId?: TransactionCategoryId;
  readonly transferTransactionId?: TransactionId;
  readonly description: string;
  readonly transactionType: TransactionType;
  readonly amount: Money;
  readonly occurredAt: IsoDateTime;
  readonly status: FinancialStatus;
  readonly reviewed: boolean;
}
