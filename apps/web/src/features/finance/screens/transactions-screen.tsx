"use client";

import { useCallback, useState, type FormEvent } from "react";
import type { TransactionType } from "@aperture/finance";
import { FinanceEmptyState, FinanceErrorBanner, FinanceLoadingState, FinancePageHeader, FinancePanel, FinanceSelectInput, FinanceSubmitButton, FinanceTextInput, formatMoney } from "../components/ui";
import { useFinanceAction } from "../hooks/use-finance-action";
import { useFinanceQuery } from "../hooks/use-finance-query";
import { useFinance } from "../providers/finance-provider";

export function TransactionsScreen() {
  const { service, context } = useFinance();
  const action = useFinanceAction();
  const [accountFilter, setAccountFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("");
  const load = useCallback(async () => {
    const [accounts, categories, transactions] = await Promise.all([
      service.accounts.list(context), service.categories.list(context),
      service.transactions.list(context, { ...(accountFilter ? { accountId: accountFilter } : {}), ...(categoryFilter ? { categoryId: categoryFilter } : {}), ...(currencyFilter ? { currency: currencyFilter } : {}) }),
    ]);
    return { accounts: accounts.items, categories: categories.items, transactions: transactions.items };
  }, [service, context, accountFilter, categoryFilter, currencyFilter]);
  const query = useFinanceQuery(load);
  const submitCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element);
    void action.execute(() => service.categories.create(context, { name: String(form.get("categoryName")), kind: String(form.get("categoryKind")) as TransactionType })).then((result) => { if (result) element.reset(); });
  };
  const submitTransaction = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const element = event.currentTarget; const form = new FormData(element); const categoryId = String(form.get("categoryId"));
    void action.execute(() => service.transactions.create(context, { accountId: String(form.get("accountId")), ...(categoryId ? { categoryId } : {}), description: String(form.get("description")), transactionType: String(form.get("transactionType")) as TransactionType, amount: { amount: String(form.get("amount")), currency: String(form.get("currency")) }, occurredAt: new Date(String(form.get("occurredAt"))).toISOString() })).then((result) => { if (result) element.reset(); });
  };
  return <>
    <FinancePageHeader eyebrow="Personal ledger" title="Transactions" description="Record manual income and expenses, then narrow the ledger by account, category, and currency." />
    <FinanceErrorBanner error={query.error ?? action.error} />
    <div className="grid grid-2">
      <FinancePanel title="Add category"><form className="form-grid" onSubmit={submitCategory}><FinanceTextInput label="Category name *" name="categoryName" required /><FinanceSelectInput label="Kind *" name="categoryKind"><option value="expense">expense</option><option value="income">income</option><option value="transfer">transfer</option></FinanceSelectInput><FinanceSubmitButton pending={action.pending}>Add category</FinanceSubmitButton></form></FinancePanel>
      <FinancePanel title="Add transaction" description="The currency must match the selected account."><form className="form-grid" onSubmit={submitTransaction}>
        <FinanceSelectInput label="Account *" name="accountId" required><option value="">Choose account</option>{query.data?.accounts.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</FinanceSelectInput>
        <FinanceSelectInput label="Category" name="categoryId"><option value="">No category</option>{query.data?.categories.map((item) => <option value={item.id} key={item.id}>{item.name} ({item.kind})</option>)}</FinanceSelectInput>
        <FinanceSelectInput label="Type *" name="transactionType"><option value="expense">expense</option><option value="income">income</option><option value="transfer">transfer</option></FinanceSelectInput>
        <FinanceTextInput label="Description *" name="description" required /><FinanceTextInput label="Amount *" name="amount" inputMode="decimal" required /><FinanceTextInput label="Currency *" name="currency" defaultValue="USD" minLength={3} maxLength={3} required /><FinanceTextInput label="Occurred at *" name="occurredAt" type="datetime-local" required />
        <FinanceSubmitButton pending={action.pending}>Add transaction</FinanceSubmitButton>
      </form></FinancePanel>
    </div>
    <FinancePanel title="Transaction ledger" description="Filters use AND semantics.">
      <div className="filter-row"><FinanceSelectInput label="Filter by account" name="accountFilter" value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)}><option value="">All accounts</option>{query.data?.accounts.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</FinanceSelectInput><FinanceSelectInput label="Filter by category" name="categoryFilter" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="">All categories</option>{query.data?.categories.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</FinanceSelectInput><FinanceTextInput label="Filter by currency" name="currencyFilter" value={currencyFilter} onChange={(event) => setCurrencyFilter(event.target.value.toUpperCase())} maxLength={3} /></div>
      {query.loading || !query.data ? <FinanceLoadingState /> : query.data.transactions.length === 0 ? <FinanceEmptyState title="No matching transactions" description="Add a transaction or change the filters." /> : <ul className="record-list">{query.data.transactions.map((item) => <li className="record-card" key={item.id}><div><h3>{item.description}</h3><p>{formatMoney(item.amount)} · {item.transactionType} · {new Date(item.occurredAt).toLocaleString()}</p></div><button className="button button-danger" onClick={() => void action.execute(() => service.transactions.delete(context, item.id))}>Delete</button></li>)}</ul>}
    </FinancePanel>
  </>;
}
