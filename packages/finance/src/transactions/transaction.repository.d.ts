import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateTransactionInput, CreateTransactionSplitInput, TransactionListQuery, TransactionSplitListQuery, UpdateTransactionInput, UpdateTransactionSplitInput } from "./transaction.contracts.js";
import type { TransactionSplit, TransactionSplitId } from "./transaction-split.types.js";
import type { Transaction, TransactionId } from "./transaction.types.js";
export interface TransactionRepository extends CrudRepository<Transaction, TransactionId, CreateTransactionInput, UpdateTransactionInput, TransactionListQuery> {}
export interface TransactionSplitRepository extends CrudRepository<TransactionSplit, TransactionSplitId, CreateTransactionSplitInput, UpdateTransactionSplitInput, TransactionSplitListQuery> {}
