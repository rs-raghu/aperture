import type { FinancialStatus, IsoDate, OwnerId, OwnerQuery, PageResult } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { Percentage } from "../percentage.types.js";
import type { FinancialGoal, FinancialGoalId } from "./financial-goal.types.js";
export interface CreateFinancialGoalInput { readonly ownerId: OwnerId; readonly name: string; readonly targetAmount: Money; readonly recordedProgressAmount?: Money; readonly targetDate?: IsoDate; }
export interface UpdateFinancialGoalInput { readonly name?: string; readonly targetAmount?: Money; readonly recordedProgressAmount?: Money; readonly targetDate?: IsoDate; readonly status?: FinancialStatus; }
export interface FinancialGoalListQuery extends OwnerQuery { readonly status?: FinancialStatus; }
export interface FinancialGoalProgress { readonly financialGoalId: FinancialGoalId; readonly recordedAmount: Money; readonly targetAmount: Money; readonly progress: Percentage; }
export declare function createFinancialGoal(input: CreateFinancialGoalInput): Promise<FinancialGoal>;
export declare function updateFinancialGoal(id: FinancialGoalId, ownerId: OwnerId, input: UpdateFinancialGoalInput): Promise<FinancialGoal>;
export declare function completeFinancialGoal(id: FinancialGoalId, ownerId: OwnerId): Promise<FinancialGoal>;
export declare function archiveFinancialGoal(id: FinancialGoalId, ownerId: OwnerId): Promise<FinancialGoal>;
export declare function getFinancialGoal(id: FinancialGoalId, ownerId: OwnerId): Promise<FinancialGoal | null>;
export declare function listFinancialGoals(query: FinancialGoalListQuery): Promise<PageResult<FinancialGoal>>;
export declare function getFinancialGoalProgress(id: FinancialGoalId, ownerId: OwnerId): Promise<FinancialGoalProgress>;
