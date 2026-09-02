import type { DateRange, IsoDateTime, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { FinancialAccountId } from "../accounts/financial-account.types.js";
import type { TransactionCategoryId } from "../categories/transaction-category.types.js";
import type { TransactionSplit, TransactionSplitId } from "./transaction-split.types.js";
import type { Transaction, TransactionId, TransactionType } from "./transaction.types.js";

export interface CreateTransactionInput { readonly ownerId: OwnerId; readonly accountId: FinancialAccountId; readonly categoryId?: TransactionCategoryId; readonly description: string; readonly transactionType: TransactionType; readonly amount: Money; readonly occurredAt: IsoDateTime; }
export interface UpdateTransactionInput { readonly categoryId?: TransactionCategoryId; readonly description?: string; readonly amount?: Money; readonly occurredAt?: IsoDateTime; }
export interface TransactionListQuery extends OwnerQuery { readonly accountId?: FinancialAccountId; readonly categoryId?: TransactionCategoryId; readonly range?: DateRange; }
export interface TransactionsByAccountQuery extends OwnerQuery { readonly accountId: FinancialAccountId; }
export interface TransactionsByDateRangeQuery extends OwnerQuery { readonly range: DateRange; }
export interface CreateTransactionSplitInput { readonly ownerId: OwnerId; readonly transactionId: TransactionId; readonly categoryId?: TransactionCategoryId; readonly amount: Money; readonly sequence: number; }
export interface UpdateTransactionSplitInput { readonly categoryId?: TransactionCategoryId; readonly amount?: Money; readonly sequence?: number; }
export interface TransactionSplitListQuery extends OwnerQuery { readonly transactionId?: TransactionId; }
export interface CategorizeTransactionInput { readonly transactionId: TransactionId; readonly categoryId: TransactionCategoryId; readonly ownerId: OwnerId; }
export interface TransferLinkInput { readonly transactionId: TransactionId; readonly relatedTransactionId: TransactionId; readonly ownerId: OwnerId; }
export interface PossibleDuplicateTransactionPair { readonly firstTransactionId: TransactionId; readonly secondTransactionId: TransactionId; }
export interface PossibleTransferMatch { readonly sourceTransactionId: TransactionId; readonly destinationTransactionId: TransactionId; }

export declare function createTransaction(input: CreateTransactionInput): Promise<Transaction>;
export declare function updateTransaction(id: TransactionId, ownerId: OwnerId, input: UpdateTransactionInput): Promise<Transaction>;
export declare function deleteTransaction(id: TransactionId, ownerId: OwnerId): Promise<void>;
export declare function getTransaction(id: TransactionId, ownerId: OwnerId): Promise<Transaction | null>;
export declare function listTransactions(query: TransactionListQuery): Promise<PageResult<Transaction>>;
export declare function listTransactionsByAccount(query: TransactionsByAccountQuery): Promise<PageResult<Transaction>>;
export declare function listTransactionsByDateRange(query: TransactionsByDateRangeQuery): Promise<PageResult<Transaction>>;
export declare function splitTransaction(input: CreateTransactionSplitInput): Promise<TransactionSplit>;
export declare function replaceTransactionSplits(transactionId: TransactionId, ownerId: OwnerId, inputs: readonly CreateTransactionSplitInput[]): Promise<readonly TransactionSplit[]>;
export declare function categorizeTransaction(input: CategorizeTransactionInput): Promise<Transaction>;
export declare function markTransactionAsTransfer(id: TransactionId, ownerId: OwnerId): Promise<Transaction>;
export declare function linkTransferTransactions(input: TransferLinkInput): Promise<readonly [Transaction, Transaction]>;
export declare function markTransactionReviewed(id: TransactionId, ownerId: OwnerId): Promise<Transaction>;
export declare function findPossibleDuplicateTransactions(query: TransactionListQuery): Promise<readonly PossibleDuplicateTransactionPair[]>;
export declare function findPossibleTransferMatches(query: TransactionListQuery): Promise<readonly PossibleTransferMatch[]>;
