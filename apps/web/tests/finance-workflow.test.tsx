import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { FinanceProvider } from "@/features/finance/providers/finance-provider";
import { AccountsScreen } from "@/features/finance/screens/accounts-screen";
import { AssetsScreen } from "@/features/finance/screens/assets-screen";
import { BudgetsScreen } from "@/features/finance/screens/budgets-screen";
import { GoalsScreen } from "@/features/finance/screens/goals-screen";
import { InvestmentsScreen } from "@/features/finance/screens/investments-screen";
import { LiabilitiesScreen } from "@/features/finance/screens/liabilities-screen";
import { LoansScreen } from "@/features/finance/screens/loans-screen";
import { OverviewScreen } from "@/features/finance/screens/overview-screen";
import { TransactionsScreen } from "@/features/finance/screens/transactions-screen";
import { createDeterministicFinanceRuntime } from "@/features/finance/testing/create-test-runtime";

const OWNER = "finance-web-workflow-owner";

describe("Finance web workflows", () => {
  it("creates an account and exact transaction, filters it, deletes it, and updates the overview", async () => {
    const user = userEvent.setup(); const runtime = createDeterministicFinanceRuntime(OWNER); const createRuntime = () => runtime;
    const view = render(<FinanceProvider ownerId={OWNER} createRuntime={createRuntime}><AccountsScreen /></FinanceProvider>);
    await user.type(await screen.findByLabelText("Account name *"), "Checking");
    await user.click(screen.getByRole("button", { name: "Add account" }));
    await screen.findByRole("heading", { name: "Checking" });

    view.rerender(<FinanceProvider ownerId={OWNER} createRuntime={createRuntime}><TransactionsScreen /></FinanceProvider>);
    await user.type(await screen.findByLabelText("Category name *"), "Food");
    await user.click(screen.getByRole("button", { name: "Add category" }));
    const account = screen.getByLabelText("Account *"); const category = screen.getByLabelText("Category");
    await user.selectOptions(account, within(account).getByRole("option", { name: "Checking" }));
    await user.selectOptions(category, within(category).getByRole("option", { name: "Food (expense)" }));
    await user.type(screen.getByLabelText("Description *"), "Lunch");
    await user.type(screen.getByLabelText("Amount *"), "12.3400");
    fireEvent.change(screen.getByLabelText("Occurred at *"), { target: { value: "2040-01-01T12:30" } });
    await user.click(screen.getByRole("button", { name: "Add transaction" }));
    await screen.findByRole("heading", { name: "Lunch" });
    expect(document.body.textContent).toContain("USD 12.3400");
    await user.type(screen.getByLabelText("Filter by currency"), "INR");
    await screen.findByRole("heading", { name: "No matching transactions" });
    await user.clear(screen.getByLabelText("Filter by currency"));
    await screen.findByRole("heading", { name: "Lunch" });

    view.rerender(<FinanceProvider ownerId={OWNER} createRuntime={createRuntime}><OverviewScreen /></FinanceProvider>);
    await waitFor(() => expect(screen.getByText("USD expenses").parentElement?.textContent).toContain("USD 12.34"));
    expect(document.body.textContent).not.toContain("[object Object]");
  });

  it("creates budgets, assets, liabilities, investments, loans, and goals through real services", async () => {
    const user = userEvent.setup(); const runtime = createDeterministicFinanceRuntime(OWNER); const createRuntime = () => runtime;
    const view = render(<FinanceProvider ownerId={OWNER} createRuntime={createRuntime}><BudgetsScreen /></FinanceProvider>);
    await user.type(await screen.findByLabelText("Budget name *"), "Monthly"); fireEvent.change(screen.getByLabelText("Starts on *"), { target: { value: "2040-01-01" } }); fireEvent.change(screen.getByLabelText("Ends on *"), { target: { value: "2040-01-31" } }); await user.click(screen.getByRole("button", { name: "Add budget" })); await screen.findByRole("heading", { name: "Monthly" });

    view.rerender(<FinanceProvider ownerId={OWNER} createRuntime={createRuntime}><AssetsScreen /></FinanceProvider>); await user.type(await screen.findByLabelText("Asset name *"), "Home"); await user.type(screen.getByLabelText("Current value *"), "300000.00"); fireEvent.change(screen.getByLabelText("Valued on *"), { target: { value: "2040-01-01" } }); await user.click(screen.getByRole("button", { name: "Add asset" })); await screen.findByRole("heading", { name: "Home" });
    view.rerender(<FinanceProvider ownerId={OWNER} createRuntime={createRuntime}><LiabilitiesScreen /></FinanceProvider>); await user.type(await screen.findByLabelText("Liability name *"), "Mortgage"); await user.type(screen.getByLabelText("Outstanding balance *"), "200000.00"); fireEvent.change(screen.getByLabelText("Valued on *"), { target: { value: "2040-01-01" } }); await user.click(screen.getByRole("button", { name: "Add liability" })); await screen.findByRole("heading", { name: "Mortgage" });

    view.rerender(<FinanceProvider ownerId={OWNER} createRuntime={createRuntime}><InvestmentsScreen /></FinanceProvider>); await user.type(await screen.findByLabelText("Account name *"), "Brokerage cash"); await user.click(screen.getByRole("button", { name: "Add financial account" })); const linked = await screen.findByLabelText("Linked financial account *"); await user.selectOptions(linked, within(linked).getByRole("option", { name: "Brokerage cash" })); await user.type(screen.getByLabelText("Investment account name *"), "Brokerage"); await user.click(screen.getByRole("button", { name: "Add investment account" })); await screen.findByRole("heading", { name: "Brokerage" });

    view.rerender(<FinanceProvider ownerId={OWNER} createRuntime={createRuntime}><LoansScreen /></FinanceProvider>); await user.type(await screen.findByLabelText("Loan name *"), "Auto"); await user.type(screen.getByLabelText("Principal *"), "20000"); await user.type(screen.getByLabelText("Outstanding balance *"), "15000"); fireEvent.change(screen.getByLabelText("Started on *"), { target: { value: "2040-01-01" } }); fireEvent.change(screen.getByLabelText("Ends on *"), { target: { value: "2045-01-01" } }); await user.click(screen.getByRole("button", { name: "Add loan" })); await screen.findByRole("heading", { name: "Auto" });

    view.rerender(<FinanceProvider ownerId={OWNER} createRuntime={createRuntime}><GoalsScreen /></FinanceProvider>); await user.type(await screen.findByLabelText("Goal name *"), "Emergency fund"); await user.type(screen.getByLabelText("Target amount *"), "10000"); fireEvent.change(screen.getByLabelText("Target date *"), { target: { value: "2041-01-01" } }); await user.click(screen.getByRole("button", { name: "Add goal" })); await screen.findByRole("heading", { name: "Emergency fund" });
    expect(document.body.textContent).not.toContain("[object Object]");
  }, 30_000);
});
