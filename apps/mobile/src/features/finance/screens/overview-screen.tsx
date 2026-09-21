import { useCallback } from "react";
import { View } from "react-native";
import { EmptyState, ErrorBanner, LoadingState, Metric, NavigationCard, PageHeader, Panel, PreviewNotice, RecordCard, RecordList, Screen, formatMoney } from "../components/ui";
import { useFinanceQuery } from "../hooks/use-finance-query";
import { useFinance } from "../providers/finance-provider";

const destinations = [
  ["/finance/accounts", "Accounts", "Manual cash and credit account records."], ["/finance/transactions", "Transactions", "Income, expenses, categories, and filters."],
  ["/finance/budgets", "Budgets", "Dated plans and category allocations."], ["/finance/assets", "Assets", "Manual asset values and valuation dates."],
  ["/finance/liabilities", "Liabilities", "Balances you enter and control."], ["/finance/investments", "Investments", "Linked investment account records."],
  ["/finance/loans", "Loans", "Principal and outstanding loan balances."], ["/finance/goals", "Goals", "Targets and manually recorded progress."],
  ["/calculators", "Calculator Hub", "38 academic and financial calculators."],
] as const;

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
  return <Screen testID="finance-overview-screen"><PageHeader eyebrow="Private ledger" title="Finance overview" description="Review records you enter yourself. Amounts remain exact decimal strings, currencies are never converted implicitly, and calculator results are estimates." /><PreviewNotice /><ErrorBanner error={query.error} />
    {query.loading || !query.data ? <LoadingState /> : <>
      <Panel title="Recorded summary" description="USD totals include only records already entered in USD."><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}><Metric label="Accounts" value={String(query.data.accounts.length)} detail="owner-scoped records" /><Metric label="USD expenses" value={formatMoney(query.data.transactionSummary.expenses)} detail="recorded transactions" /><Metric label="Recorded net worth" value={formatMoney(query.data.netWorth.recordedNetWorth)} detail="assets less liabilities" /></View></Panel>
      <Panel title="Recent transactions" description="Newest entries appear first.">{query.data.transactions.length === 0 ? <EmptyState title="No transactions yet" description="Create an account and add a transaction to begin your local ledger." href="/finance/accounts" action="Add an account" /> : <RecordList items={query.data.transactions.slice(0, 5)} keyExtractor={(item) => item.id} accessibilityLabel="Recent transactions" renderItem={(item) => <RecordCard title={item.description} details={[`${formatMoney(item.amount)} · ${item.transactionType}`]} />} />}</Panel>
    </>}
    <Panel title="Finance tools" description="Each screen uses the same owner-scoped repository service.">{destinations.map(([href, title, description]) => <NavigationCard key={href} href={href} title={title} description={description} />)}</Panel>
  </Screen>;
}
