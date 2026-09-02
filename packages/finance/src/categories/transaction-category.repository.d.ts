import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateTransactionCategoryInput, TransactionCategoryListQuery, UpdateTransactionCategoryInput } from "./transaction-category.contracts.js";
import type { TransactionCategory, TransactionCategoryId } from "./transaction-category.types.js";
export interface TransactionCategoryRepository extends CrudRepository<TransactionCategory, TransactionCategoryId, CreateTransactionCategoryInput, UpdateTransactionCategoryInput, TransactionCategoryListQuery> {}
