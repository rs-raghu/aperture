import type { FinancialAccountId } from "../accounts/financial-account.types.js";
import type { BudgetId } from "../budgets/budget.types.js";
import type { CashFlowSummary } from "../cash-flow/cash-flow.types.js";
import type { CurrencyCode, DateRange, IsoDate, OwnerId } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { Percentage } from "../percentage.types.js";

export interface FinanceOverview { readonly accountCount: number; readonly transactionCount: number; readonly activeGoalCount: number; }
export interface AccountSummary { readonly accountId: FinancialAccountId; readonly recordedBalance: Money; }
export interface TransactionSummary { readonly range: DateRange; readonly income: Money; readonly expenses: Money; readonly transactionCount: number; }
export interface BudgetSummary { readonly budgetId: BudgetId; readonly allocated: Money; readonly recordedSpending: Money; }
export interface NetWorthServiceSummary { readonly totalAssets: Money; readonly totalLiabilities: Money; readonly recordedNetWorth: Money; }
export interface DebtSummary { readonly outstandingDebt: Money; readonly activeLoanCount: number; }
export interface PortfolioSummary { readonly recordedCost: Money; readonly recordedMarketValue: Money; }
export interface UpcomingRecurringPaymentSummary { readonly count: number; readonly recordedAmount: Money; readonly before: IsoDate; }
export interface UpcomingInsuranceRenewalSummary { readonly count: number; readonly before: IsoDate; }
export interface FinancialGoalSummary { readonly targetAmount: Money; readonly recordedAmount: Money; readonly recordedProgress: Percentage; }
export interface TaxSummary { readonly financialYear: string; readonly recordedAmount: Money; }
export interface ImportSummary { readonly importCount: number; readonly acceptedRowCount: number; readonly rejectedRowCount: number; }
export interface FinanceSummaryQuery { readonly ownerId: OwnerId; readonly currency: CurrencyCode; readonly range?: DateRange; }

export interface FinanceService {
  getFinanceOverview(query: FinanceSummaryQuery): Promise<FinanceOverview>;
  getAccountSummary(ownerId: OwnerId, accountId: FinancialAccountId): Promise<AccountSummary>;
  getTransactionSummary(query: FinanceSummaryQuery): Promise<TransactionSummary>;
  getBudgetSummary(ownerId: OwnerId, budgetId: BudgetId): Promise<BudgetSummary>;
  getCashFlowSummary(query: FinanceSummaryQuery): Promise<CashFlowSummary>;
  getNetWorthSummary(query: FinanceSummaryQuery): Promise<NetWorthServiceSummary>;
  getDebtSummary(query: FinanceSummaryQuery): Promise<DebtSummary>;
  getPortfolioSummary(query: FinanceSummaryQuery): Promise<PortfolioSummary>;
  getUpcomingRecurringPayments(query: FinanceSummaryQuery, before: IsoDate): Promise<UpcomingRecurringPaymentSummary>;
  getUpcomingInsuranceRenewals(query: FinanceSummaryQuery, before: IsoDate): Promise<UpcomingInsuranceRenewalSummary>;
  getFinancialGoalSummary(query: FinanceSummaryQuery): Promise<FinancialGoalSummary>;
  getTaxSummary(query: FinanceSummaryQuery, financialYear: string): Promise<TaxSummary>;
  getImportSummary(ownerId: OwnerId): Promise<ImportSummary>;
}
