import type { FinancialMetadata } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { TransactionCategoryId } from "../categories/transaction-category.types.js";
import type { TransactionId } from "./transaction.types.js";

export type TransactionSplitId = string;

export interface TransactionSplit extends FinancialMetadata {
  readonly id: TransactionSplitId;
  readonly transactionId: TransactionId;
  readonly categoryId?: TransactionCategoryId;
  readonly amount: Money;
  readonly sequence: number;
}
