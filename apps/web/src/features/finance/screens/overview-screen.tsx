"use client";

import { useCallback } from "react";
import { FinanceEmptyState, FinanceErrorBanner, FinanceLoadingState, FinancePageHeader, FinancePanel, formatMoney } from "../components/ui";
import { useFinanceQuery } from "../hooks/use-finance-query";
import { useFinance } from "../providers/finance-provider";

export function OverviewScreen() {
  const { service, context } = useFinance();
  const load = useCallback(async () => {
    const [accounts, transactions, budgets, goals, transactionSummary, netWorth] = await Promise.all([
      service.accounts.list(context), service.transactions.list(context), service.budgets.list(context), service.goals.list(context),
      service.summaries.transactions(context, "USD"), service.summaries.netWorth(context, "USD"),
    ]);
    return { accounts: accounts.items, transactions: transactions.items, budgets: budgets.items, goals: goals.items, transactionSummary, netWorth };
  }, [service, context]);
  const query = useFinanceQuery(load);
  return <>
    <FinancePageHeader eyebrow="Private ledger" title="Finance overview" description="Review records you enter yourself. Amounts remain exact decimal strings, currencies are never converted implicitly, and calculator results are estimates." />
    <FinanceErrorBanner error={query.error} />
    {query.loading || !query.data ? <FinanceLoadingState /> : <>
      <div className="grid metric-grid">
        <article className="metric"><span className="metric-label">Accounts</span><strong className="metric-value">{query.data.accounts.length}</strong><span className="metric-detail">owner-scoped records</span></article>
        <article className="metric"><span className="metric-label">USD expenses</span><strong className="metric-value">{formatMoney(query.data.transactionSummary.expenses)}</strong><span className="metric-detail">from recorded transactions</span></article>
        <article className="metric"><span className="metric-label">Recorded net worth</span><strong className="metric-value">{formatMoney(query.data.netWorth.recordedNetWorth)}</strong><span className="metric-detail">USD assets less liabilities</span></article>
      </div>
      <div className="grid grid-2">
        <FinancePanel title="Recent transactions" description="Newest entries appear first.">
          {query.data.transactions.length === 0 ? <FinanceEmptyState title="No transactions yet" description="Create an account and add a transaction to begin your local ledger." /> : <ul className="record-list">{query.data.transactions.slice(0, 5).map((item) => <li className="record-card" key={item.id}><div><h3>{item.description}</h3><p>{formatMoney(item.amount)} · {item.transactionType}</p></div></li>)}</ul>}
        </FinancePanel>
        <FinancePanel title="Plans" description="Budgets and financial goals in your workspace.">
          {query.data.budgets.length + query.data.goals.length === 0 ? <FinanceEmptyState title="No plans yet" description="Create a budget or goal to see it here." /> : <ul className="record-list">
            {query.data.budgets.map((item) => <li className="record-card" key={item.id}><div><h3>{item.name}</h3><p>Budget · {item.period}</p></div></li>)}
            {query.data.goals.map((item) => <li className="record-card" key={item.id}><div><h3>{item.name}</h3><p>Goal · {formatMoney(item.targetAmount)}</p></div></li>)}
          </ul>}
        </FinancePanel>
      </div>
    </>}
  </>;
}
