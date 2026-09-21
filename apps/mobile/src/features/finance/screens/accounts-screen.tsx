import { useCallback, useState } from "react";
import type { FinancialAccountType } from "@aperture/finance";
import { ActionButton, ChoiceField, EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, RecordCard, RecordList, Screen, TextField } from "../components/ui";
import { useFinanceAction } from "../hooks/use-finance-action";
import { useFinanceQuery } from "../hooks/use-finance-query";
import { useFinance } from "../providers/finance-provider";

const accountTypes: readonly FinancialAccountType[] = ["cash", "bank", "credit_card", "loan", "investment", "retirement", "fixed_deposit", "other"];

export function AccountsScreen() {
  const { service, context } = useFinance(); const action = useFinanceAction();
  const [name, setName] = useState(""); const [accountType, setAccountType] = useState<FinancialAccountType>("bank"); const [currency, setCurrency] = useState("USD");
  const load = useCallback(() => service.accounts.list(context), [service, context]); const query = useFinanceQuery(load);
  const submit = () => void action.execute(() => service.accounts.create(context, { name, accountType, currency })).then((result) => { if (result) setName(""); });
  return <Screen testID="finance-accounts-screen"><PageHeader eyebrow="Cash structure" title="Accounts" description="Create descriptive account records without connecting a bank or entering online banking credentials." /><ErrorBanner error={query.error ?? action.error} />
    <Panel title="Add account" description="Only a name, type, and ISO currency code are stored."><TextField label="Account name" name="account-name" value={name} onChangeText={setName} required error={action.error?.fieldErrors.name} /><ChoiceField label="Account type" value={accountType} onChange={setAccountType} options={accountTypes.map((value) => ({ value, label: value.replaceAll("_", " ") }))} required /><TextField label="Currency" name="account-currency" value={currency} onChangeText={(value) => setCurrency(value.toUpperCase())} autoCapitalize="characters" required error={action.error?.fieldErrors.currency} /><ActionButton label="Add account" pending={action.pending} onPress={submit} /></Panel>
    <Panel title="Stored accounts" description="Closing or archiving preserves the record.">{query.loading || !query.data ? <LoadingState /> : query.data.items.length === 0 ? <EmptyState title="No accounts" description="Add an account to start recording Finance data." /> : <RecordList items={query.data.items} keyExtractor={(item) => item.id} accessibilityLabel="Stored accounts" renderItem={(item) => <RecordCard title={item.name} status={item.status} details={[`${item.currency} · ${item.accountType.replaceAll("_", " ")}`]}>{item.status === "active" ? <><ActionButton label="Close" tone="secondary" onPress={() => void action.execute(() => service.accounts.close(context, item.id))} /><ActionButton label="Archive" tone="danger" onPress={() => void action.execute(() => service.accounts.archive(context, item.id))} /></> : null}</RecordCard>} />}</Panel>
  </Screen>;
}
