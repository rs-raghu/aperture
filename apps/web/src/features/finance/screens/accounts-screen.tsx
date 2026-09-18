"use client";

import { useCallback, type FormEvent } from "react";
import type { FinancialAccountType } from "@aperture/finance";
import { FinanceEmptyState, FinanceErrorBanner, FinanceLoadingState, FinancePageHeader, FinancePanel, FinanceSelectInput, FinanceStatusBadge, FinanceSubmitButton, FinanceTextInput } from "../components/ui";
import { useFinanceAction } from "../hooks/use-finance-action";
import { useFinanceQuery } from "../hooks/use-finance-query";
import { useFinance } from "../providers/finance-provider";

const accountTypes: readonly FinancialAccountType[] = ["cash", "bank", "credit_card", "loan", "investment", "retirement", "fixed_deposit", "other"];

export function AccountsScreen() {
  const { service, context } = useFinance();
  const action = useFinanceAction();
  const load = useCallback(() => service.accounts.list(context), [service, context]);
  const query = useFinanceQuery(load);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    void action.execute(() => service.accounts.create(context, { name: String(form.get("name")), accountType: String(form.get("accountType")) as FinancialAccountType, currency: String(form.get("currency")) })).then((result) => { if (result) element.reset(); });
  };
  return <>
    <FinancePageHeader eyebrow="Cash structure" title="Accounts" description="Create descriptive account records without connecting a bank or entering online banking credentials." />
    <FinanceErrorBanner error={query.error ?? action.error} />
    <div className="grid grid-2">
      <FinancePanel title="Add account" description="Only a name, type, and ISO currency code are stored."><form className="form-grid" onSubmit={submit}>
        <FinanceTextInput label="Account name *" name="name" required />
        <FinanceSelectInput label="Account type *" name="accountType">{accountTypes.map((type) => <option key={type} value={type}>{type.replaceAll("_", " ")}</option>)}</FinanceSelectInput>
        <FinanceTextInput label="Currency *" name="currency" defaultValue="USD" minLength={3} maxLength={3} required />
        <FinanceSubmitButton pending={action.pending}>Add account</FinanceSubmitButton>
      </form></FinancePanel>
      <FinancePanel title="Stored accounts" description="Closing or archiving preserves the record.">
        {query.loading || !query.data ? <FinanceLoadingState /> : query.data.items.length === 0 ? <FinanceEmptyState title="No accounts" description="Add an account to start recording Finance data." /> : <ul className="record-list">{query.data.items.map((item) => <li className="record-card" key={item.id}><div><h3>{item.name}</h3><p>{item.currency} · {item.accountType.replaceAll("_", " ")}</p></div><div className="record-actions"><FinanceStatusBadge value={item.status} />{item.status === "active" && <><button className="button button-secondary" onClick={() => void action.execute(() => service.accounts.close(context, item.id))}>Close</button><button className="button button-ghost" onClick={() => void action.execute(() => service.accounts.archive(context, item.id))}>Archive</button></>}</div></li>)}</ul>}
      </FinancePanel>
    </div>
  </>;
}
