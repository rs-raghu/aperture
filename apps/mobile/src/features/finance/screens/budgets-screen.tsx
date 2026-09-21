import { useCallback, useState } from "react";
import type { FinancialPeriod } from "@aperture/finance";
import { ActionButton, ChoiceField, EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, RecordCard, RecordList, Screen, TextField, formatMoney } from "../components/ui";
import { useFinanceAction } from "../hooks/use-finance-action";
import { useFinanceQuery } from "../hooks/use-finance-query";
import { useFinance } from "../providers/finance-provider";

const periods: readonly FinancialPeriod[] = ["month", "quarter", "year", "custom"];
const today = () => new Date().toISOString().slice(0, 10);

export function BudgetsScreen() {
  const { service, context } = useFinance(); const action = useFinanceAction();
  const [name, setName] = useState(""); const [currency, setCurrency] = useState("USD"); const [period, setPeriod] = useState<FinancialPeriod>("month"); const [startsOn, setStartsOn] = useState(today()); const [endsOn, setEndsOn] = useState(today());
  const [categoryName, setCategoryName] = useState(""); const [budgetId, setBudgetId] = useState(""); const [categoryId, setCategoryId] = useState(""); const [amount, setAmount] = useState("");
  const load = useCallback(async () => { const [budgetPage, categoryPage] = await Promise.all([service.budgets.list(context), service.categories.list(context, { kind: "expense" })]); const linePages = await Promise.all(budgetPage.items.map(({ id }) => service.budgetLines.list(context, { budgetId: id }))); return { budgets: budgetPage.items, categories: categoryPage.items, lines: linePages.flatMap(({ items }) => items) }; }, [service, context]);
  const query = useFinanceQuery(load);
  const addBudget = () => void action.execute(() => service.budgets.create(context, { name, currency, period, startsOn, endsOn })).then((result) => { if (result) setName(""); });
  const addCategory = () => void action.execute(() => service.categories.create(context, { name: categoryName, kind: "expense" })).then((result) => { if (result) setCategoryName(""); });
  const addLine = () => { const budget = query.data?.budgets.find((item) => item.id === budgetId); void action.execute(() => service.budgetLines.create(context, { budgetId, categoryId, allocatedAmount: { amount, currency: budget?.currency ?? "USD" } })).then((result) => { if (result) setAmount(""); }); };
  return <Screen testID="finance-budgets-screen"><PageHeader eyebrow="Spending plan" title="Budgets" description="Create dated budgets and allocate exact amounts to expense categories." /><ErrorBanner error={query.error ?? action.error} />
    <Panel title="Add budget"><TextField label="Budget name" name="budget-name" value={name} onChangeText={setName} required /><TextField label="Currency" name="budget-currency" value={currency} onChangeText={(value) => setCurrency(value.toUpperCase())} autoCapitalize="characters" required /><ChoiceField label="Period" value={period} onChange={setPeriod} options={periods.map((value) => ({ value, label: value }))} /><TextField label="Starts on" name="budget-start" value={startsOn} onChangeText={setStartsOn} hint="Use YYYY-MM-DD." required /><TextField label="Ends on" name="budget-end" value={endsOn} onChangeText={setEndsOn} hint="Use YYYY-MM-DD." required /><ActionButton label="Add budget" pending={action.pending} onPress={addBudget} /></Panel>
    <Panel title="Add expense category"><TextField label="Category name" name="budget-category-name" value={categoryName} onChangeText={setCategoryName} required /><ActionButton label="Add category" pending={action.pending} onPress={addCategory} /></Panel>
    <Panel title="Allocate category"><ChoiceField label="Budget" value={budgetId} onChange={setBudgetId} options={(query.data?.budgets ?? []).map((item) => ({ value: item.id, label: item.name }))} required /><ChoiceField label="Expense category" value={categoryId} onChange={setCategoryId} options={(query.data?.categories ?? []).map((item) => ({ value: item.id, label: item.name }))} required /><TextField label="Allocated amount" name="budget-line-amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" required /><ActionButton label="Add allocation" pending={action.pending} disabled={!budgetId || !categoryId} onPress={addLine} /></Panel>
    <Panel title="Budget plans">{query.loading || !query.data ? <LoadingState /> : query.data.budgets.length === 0 ? <EmptyState title="No budgets" description="Add a dated spending plan above." /> : <RecordList items={query.data.budgets} keyExtractor={(item) => item.id} accessibilityLabel="Budget plans" renderItem={(budget) => <RecordCard title={budget.name} status={budget.status} details={[`${budget.period} · ${budget.startsOn} to ${budget.endsOn}`, ...(query.data?.lines ?? []).filter((line) => line.budgetId === budget.id).map((line) => `${(query.data?.categories ?? []).find((category) => category.id === line.categoryId)?.name ?? "Category"}: ${formatMoney(line.allocatedAmount)}`)]} />} />}</Panel>
  </Screen>;
}
