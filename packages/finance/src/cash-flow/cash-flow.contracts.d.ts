import type { DateRange, OwnerId } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { CashFlowSummary, CategorySpendingSummary, SavingsRateSummary } from "./cash-flow.types.js";
export interface CashFlowSummaryQuery { readonly ownerId: OwnerId; readonly range: DateRange; }
export declare function getCashFlowSummary(query: CashFlowSummaryQuery): Promise<CashFlowSummary>;
export declare function getIncomeSummary(query: CashFlowSummaryQuery): Promise<Money>;
export declare function getExpenseSummary(query: CashFlowSummaryQuery): Promise<Money>;
export declare function getSavingsRateSummary(query: CashFlowSummaryQuery): Promise<SavingsRateSummary>;
export declare function getCategorySpendingSummary(query: CashFlowSummaryQuery): Promise<readonly CategorySpendingSummary[]>;
