import type { FinancialFrequency, FinancialStatus, IsoDate, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { FinancialAccountId } from "../accounts/financial-account.types.js";
import type { RecurringTransaction, RecurringTransactionId } from "./recurring-transaction.types.js";
export interface CreateRecurringTransactionInput { readonly ownerId: OwnerId; readonly accountId: FinancialAccountId; readonly description: string; readonly amount: Money; readonly frequency: FinancialFrequency; readonly nextOccurrenceOn: IsoDate; }
export interface UpdateRecurringTransactionInput { readonly description?: string; readonly amount?: Money; readonly frequency?: FinancialFrequency; readonly nextOccurrenceOn?: IsoDate; readonly status?: FinancialStatus; }
export interface RecurringTransactionListQuery extends OwnerQuery { readonly status?: FinancialStatus; }
export interface UpcomingRecurringTransactionsQuery extends OwnerQuery { readonly before?: IsoDate; }
export declare function createRecurringTransaction(input: CreateRecurringTransactionInput): Promise<RecurringTransaction>;
export declare function updateRecurringTransaction(id: RecurringTransactionId, ownerId: OwnerId, input: UpdateRecurringTransactionInput): Promise<RecurringTransaction>;
export declare function pauseRecurringTransaction(id: RecurringTransactionId, ownerId: OwnerId): Promise<RecurringTransaction>;
export declare function resumeRecurringTransaction(id: RecurringTransactionId, ownerId: OwnerId): Promise<RecurringTransaction>;
export declare function archiveRecurringTransaction(id: RecurringTransactionId, ownerId: OwnerId): Promise<RecurringTransaction>;
export declare function getRecurringTransaction(id: RecurringTransactionId, ownerId: OwnerId): Promise<RecurringTransaction | null>;
export declare function listRecurringTransactions(query: RecurringTransactionListQuery): Promise<PageResult<RecurringTransaction>>;
export declare function listUpcomingRecurringTransactions(query: UpcomingRecurringTransactionsQuery): Promise<PageResult<RecurringTransaction>>;
