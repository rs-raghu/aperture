import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateRecurringTransactionInput, RecurringTransactionListQuery, UpdateRecurringTransactionInput } from "./recurring-transaction.contracts.js";
import type { RecurringTransaction, RecurringTransactionId } from "./recurring-transaction.types.js";
export interface RecurringTransactionRepository extends CrudRepository<RecurringTransaction, RecurringTransactionId, CreateRecurringTransactionInput, UpdateRecurringTransactionInput, RecurringTransactionListQuery> {}
