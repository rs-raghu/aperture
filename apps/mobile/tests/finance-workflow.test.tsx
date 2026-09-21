import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { FinanceProvider, OverviewScreen, useFinance } from "../src/features/finance";
import { createFinanceTestRuntime } from "../src/features/finance/testing/create-test-runtime";

function WorkflowHarness() {
  const { service, context } = useFinance(); const [complete, setComplete] = useState(false); const [overview, setOverview] = useState(false);
  const run = async () => {
    const account = await service.accounts.create(context, { name: "Daily account", accountType: "bank", currency: "USD" });
    const investmentAccount = await service.accounts.create(context, { name: "Brokerage cash", accountType: "investment", currency: "USD" });
    const category = await service.categories.create(context, { name: "Synthetic expense", kind: "expense" });
    await service.transactions.create(context, { accountId: account.id, categoryId: category.id, description: "Synthetic purchase", transactionType: "expense", amount: { amount: "12.3400", currency: "USD" }, occurredAt: "2040-01-01T07:00:00Z" });
    await service.budgets.create(context, { name: "January plan", currency: "USD", period: "month", startsOn: "2040-01-01", endsOn: "2040-01-31" });
    await service.assets.create(context, { name: "Cash reserve", assetType: "cash", currentValue: { amount: "1000.00", currency: "USD" }, valuedOn: "2040-01-01" });
    await service.liabilities.create(context, { name: "Card balance", liabilityType: "credit_card", outstandingBalance: { amount: "250.00", currency: "USD" }, valuedOn: "2040-01-01" });
    await service.investmentAccounts.create(context, { name: "Synthetic brokerage", financialAccountId: investmentAccount.id, currency: "USD" });
    await service.loans.create(context, { name: "Synthetic loan", principal: { amount: "5000", currency: "USD" }, outstandingBalance: { amount: "4000", currency: "USD" }, startedOn: "2039-01-01", endsOn: "2042-01-01" });
    await service.goals.create(context, { name: "Synthetic goal", targetAmount: { amount: "2000", currency: "USD" }, recordedProgressAmount: { amount: "500", currency: "USD" }, targetDate: "2041-01-01" });
    setComplete(true);
  };
  if (overview) return <OverviewScreen />;
  return <View><Pressable accessibilityRole="button" accessibilityLabel="Run Finance workflow" onPress={() => void run()}><Text>Run</Text></Pressable>{complete ? <><Text>Finance workflow complete</Text><Pressable accessibilityRole="button" accessibilityLabel="Navigate to Finance overview" onPress={() => setOverview(true)}><Text>Overview</Text></Pressable></> : null}</View>;
}

describe("Finance mobile workflow", () => {
  it("preserves cross-screen state and exact service summaries in one provider", async () => {
    const runtime = createFinanceTestRuntime(); const view = await render(<FinanceProvider createRuntime={() => runtime}><WorkflowHarness /></FinanceProvider>);
    await fireEvent.press(view.getByRole("button", { name: "Run Finance workflow" })); await view.findByText("Finance workflow complete"); await fireEvent.press(view.getByRole("button", { name: "Navigate to Finance overview" }));
    await waitFor(() => expect(view.getByLabelText("Accounts: 2. owner-scoped records")).toBeTruthy());
    expect(view.getByLabelText("USD expenses: USD 12.34. recorded transactions")).toBeTruthy(); expect(view.getByLabelText("Recorded net worth: USD 750. assets less liabilities")).toBeTruthy();
    expect(view.getAllByRole("link")).toHaveLength(9);
  });
});
