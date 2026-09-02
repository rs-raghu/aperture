import type { FinancialStatus, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { TransactionCategory, TransactionCategoryId, TransactionCategoryKind } from "./transaction-category.types.js";
export interface CreateTransactionCategoryInput { readonly ownerId: OwnerId; readonly name: string; readonly kind: TransactionCategoryKind; readonly systemCategory?: boolean; }
export interface UpdateTransactionCategoryInput { readonly name?: string; readonly kind?: TransactionCategoryKind; readonly status?: FinancialStatus; }
export interface TransactionCategoryListQuery extends OwnerQuery { readonly kind?: TransactionCategoryKind; }
export declare function createTransactionCategory(input: CreateTransactionCategoryInput): Promise<TransactionCategory>;
export declare function updateTransactionCategory(id: TransactionCategoryId, ownerId: OwnerId, input: UpdateTransactionCategoryInput): Promise<TransactionCategory>;
export declare function archiveTransactionCategory(id: TransactionCategoryId, ownerId: OwnerId): Promise<TransactionCategory>;
export declare function getTransactionCategory(id: TransactionCategoryId, ownerId: OwnerId): Promise<TransactionCategory | null>;
export declare function listTransactionCategories(query: TransactionCategoryListQuery): Promise<PageResult<TransactionCategory>>;
