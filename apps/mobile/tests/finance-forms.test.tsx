import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AccountsScreen, AssetsScreen, FinanceProvider, LoansScreen } from "../src/features/finance";
import { createFinanceTestRuntime } from "../src/features/finance/testing/create-test-runtime";

describe("Finance mobile forms", () => {
  it("creates and closes an account through the shared service", async () => {
    const view = await render(<FinanceProvider createRuntime={() => createFinanceTestRuntime()}><AccountsScreen /></FinanceProvider>);
    await fireEvent.changeText(view.getByLabelText("Account name"), "Daily account");
    await fireEvent.press(view.getByRole("button", { name: "Add account" }));
    await view.findByText("Daily account");
    await fireEvent.press(view.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(view.getByLabelText("Status: closed")).toBeTruthy());
  });

  it("preserves exact decimal text when recording an asset", async () => {
    const runtime = createFinanceTestRuntime();
    const view = await render(<FinanceProvider createRuntime={() => runtime}><AssetsScreen /></FinanceProvider>);
    await fireEvent.changeText(view.getByLabelText("Asset name"), "Emergency cash"); await fireEvent.changeText(view.getByLabelText("Current value"), "1234.567890");
    await fireEvent.press(view.getByRole("button", { name: "Add asset" }));
    await view.findByText(/USD 1234.567890/);
    expect((await runtime.service.assets.list(runtime.context)).items[0]?.currentValue.amount).toBe("1234.567890");
    expect(view.getByLabelText("Current value").props.keyboardType).toBe("decimal-pad");
  });

  it("keeps invalid loan values visible with a readable error", async () => {
    const view = await render(<FinanceProvider createRuntime={() => createFinanceTestRuntime()}><LoansScreen /></FinanceProvider>);
    await fireEvent.changeText(view.getByLabelText("Loan name"), "Synthetic loan"); await fireEvent.changeText(view.getByLabelText("Principal"), "100"); await fireEvent.changeText(view.getByLabelText("Outstanding balance"), "150");
    await fireEvent.press(view.getByRole("button", { name: "Add loan" }));
    await waitFor(() => expect(view.getByText(/must not exceed principal/i)).toBeTruthy());
    expect(view.getByLabelText("Outstanding balance").props.value).toBe("150");
    expect(view.queryByText("[object Object]")).toBeNull();
  });
});
