import type { CurrencyCode, FinancialPeriod, FinancialStatus, IsoDate, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { TransactionCategoryId } from "../categories/transaction-category.types.js";
import type { BudgetLine, BudgetLineId } from "./budget-line.types.js";
import type { Budget, BudgetId } from "./budget.types.js";
export interface CreateBudgetInput { readonly ownerId: OwnerId; readonly name: string; readonly currency: CurrencyCode; readonly period: FinancialPeriod; readonly startsOn: IsoDate; readonly endsOn: IsoDate; }
export interface UpdateBudgetInput { readonly name?: string; readonly startsOn?: IsoDate; readonly endsOn?: IsoDate; readonly status?: FinancialStatus; }
export interface BudgetListQuery extends OwnerQuery { readonly status?: FinancialStatus; }
export interface CreateBudgetLineInput { readonly ownerId: OwnerId; readonly budgetId: BudgetId; readonly categoryId: TransactionCategoryId; readonly allocatedAmount: Money; }
export interface UpdateBudgetLineInput { readonly categoryId?: TransactionCategoryId; readonly allocatedAmount?: Money; }
export interface BudgetLineListQuery extends OwnerQuery { readonly budgetId: BudgetId; }
export interface BudgetStatus { readonly budgetId: BudgetId; readonly allocated: Money; readonly recordedSpending: Money; }
export interface BudgetVariance { readonly budgetId: BudgetId; readonly variance: Money; }
export declare function createBudget(input: CreateBudgetInput): Promise<Budget>;
export declare function updateBudget(id: BudgetId, ownerId: OwnerId, input: UpdateBudgetInput): Promise<Budget>;
export declare function archiveBudget(id: BudgetId, ownerId: OwnerId): Promise<Budget>;
export declare function getBudget(id: BudgetId, ownerId: OwnerId): Promise<Budget | null>;
export declare function listBudgets(query: BudgetListQuery): Promise<PageResult<Budget>>;
export declare function createBudgetLine(input: CreateBudgetLineInput): Promise<BudgetLine>;
export declare function updateBudgetLine(id: BudgetLineId, ownerId: OwnerId, input: UpdateBudgetLineInput): Promise<BudgetLine>;
export declare function deleteBudgetLine(id: BudgetLineId, ownerId: OwnerId): Promise<void>;
export declare function listBudgetLines(query: BudgetLineListQuery): Promise<PageResult<BudgetLine>>;
export declare function getBudgetStatus(id: BudgetId, ownerId: OwnerId): Promise<BudgetStatus>;
export declare function getBudgetVariance(id: BudgetId, ownerId: OwnerId): Promise<BudgetVariance>;
