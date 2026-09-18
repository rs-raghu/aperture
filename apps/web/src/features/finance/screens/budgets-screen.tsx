"use client";

import { useCallback, type FormEvent } from "react";
import type { FinancialPeriod } from "@aperture/finance";
import { FinanceEmptyState, FinanceErrorBanner, FinanceLoadingState, FinancePageHeader, FinancePanel, FinanceSelectInput, FinanceStatusBadge, FinanceSubmitButton, FinanceTextInput, formatMoney } from "../components/ui";
import { useFinanceAction } from "../hooks/use-finance-action";
import { useFinanceQuery } from "../hooks/use-finance-query";
import { useFinance } from "../providers/finance-provider";

export function BudgetsScreen() {
  const { service, context } = useFinance(); const action = useFinanceAction();
  const load = useCallback(async () => {
    const [budgetPage, categoryPage] = await Promise.all([service.budgets.list(context), service.categories.list(context, { kind: "expense" })]);
    const linePages = await Promise.all(budgetPage.items.map(({ id }) => service.budgetLines.list(context, { budgetId: id })));
    return { budgets: budgetPage.items, lines: linePages.flatMap(({ items }) => items), categories: categoryPage.items };
  }, [service, context]);
  const query = useFinanceQuery(load);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); void action.execute(() => service.budgets.create(context, { name: String(form.get("name")), currency: String(form.get("currency")), period: String(form.get("period")) as FinancialPeriod, startsOn: String(form.get("startsOn")), endsOn: String(form.get("endsOn")) })).then((result) => { if (result) element.reset(); }); };
  const submitCategory = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); void action.execute(() => service.categories.create(context, { name: String(form.get("categoryName")), kind: "expense" })).then((result) => { if (result) element.reset(); }); };
  const submitLine = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); const budget = query.data?.budgets.find(({ id }) => id === String(form.get("budgetId"))); void action.execute(() => service.budgetLines.create(context, { budgetId: String(form.get("budgetId")), categoryId: String(form.get("categoryId")), allocatedAmount: { amount: String(form.get("amount")), currency: budget?.currency ?? "USD" } })).then((result) => { if (result) element.reset(); }); };
  return <><FinancePageHeader eyebrow="Spending plan" title="Budgets" description="Create dated budgets and allocate exact amounts to expense categories." /><FinanceErrorBanner error={query.error ?? action.error} />
    <div className="grid grid-3">
      <FinancePanel title="Add budget"><form className="form-grid" onSubmit={submit}><FinanceTextInput label="Budget name *" name="name" required /><FinanceTextInput label="Currency *" name="currency" defaultValue="USD" maxLength={3} required /><FinanceSelectInput label="Period *" name="period"><option value="month">month</option><option value="quarter">quarter</option><option value="year">year</option><option value="custom">custom</option></FinanceSelectInput><FinanceTextInput label="Starts on *" name="startsOn" type="date" required /><FinanceTextInput label="Ends on *" name="endsOn" type="date" required /><FinanceSubmitButton pending={action.pending}>Add budget</FinanceSubmitButton></form></FinancePanel>
      <FinancePanel title="Add expense category"><form className="form-grid" onSubmit={submitCategory}><FinanceTextInput label="Category name *" name="categoryName" required /><FinanceSubmitButton pending={action.pending}>Add category</FinanceSubmitButton></form></FinancePanel>
      <FinancePanel title="Allocate category"><form className="form-grid" onSubmit={submitLine}><FinanceSelectInput label="Budget *" name="budgetId" required><option value="">Choose budget</option>{query.data?.budgets.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</FinanceSelectInput><FinanceSelectInput label="Expense category *" name="categoryId" required><option value="">Choose category</option>{query.data?.categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</FinanceSelectInput><FinanceTextInput label="Allocated amount *" name="amount" required inputMode="decimal" /><FinanceSubmitButton pending={action.pending}>Add allocation</FinanceSubmitButton></form></FinancePanel>
    </div>
    <FinancePanel title="Budget plans">{query.loading || !query.data ? <FinanceLoadingState /> : query.data.budgets.length === 0 ? <FinanceEmptyState title="No budgets" description="Add a dated spending plan above." /> : <ul className="record-list">{query.data.budgets.map((budget) => <li className="record-card record-card-stack" key={budget.id}><div><h3>{budget.name}</h3><p>{budget.period} · {budget.startsOn} to {budget.endsOn}</p></div><FinanceStatusBadge value={budget.status} /><ul>{query.data?.lines.filter(({ budgetId }) => budgetId === budget.id).map((line) => <li key={line.id}>{query.data?.categories.find(({ id }) => id === line.categoryId)?.name ?? "Category"}: {formatMoney(line.allocatedAmount)} <button className="text-button" onClick={() => void action.execute(() => service.budgetLines.delete(context, line.id))}>Remove</button></li>)}</ul></li>)}</ul>}</FinancePanel>
  </>;
}
