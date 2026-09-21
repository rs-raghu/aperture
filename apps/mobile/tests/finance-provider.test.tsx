import { StrictMode } from "react";
import { Pressable, Text, View } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { FinanceProvider, useFinance } from "../src/features/finance";
import { createFinanceTestRuntime } from "../src/features/finance/testing/create-test-runtime";

function Probe() {
  const runtime = useFinance();
  return <View><Text testID="finance-owner">{runtime.context.ownerId}</Text><Text testID="finance-revision">{runtime.revision}</Text><Pressable accessibilityRole="button" accessibilityLabel="Refresh Finance preview" onPress={runtime.refresh}><Text>Refresh</Text></Pressable></View>;
}

describe("FinanceProvider", () => {
  it("keeps one runtime across rerenders and exposes the injected owner", async () => {
    const createRuntime = jest.fn((ownerId: string) => createFinanceTestRuntime({ ownerId }));
    const view = await render(<FinanceProvider ownerId="finance-mobile-owner" createRuntime={createRuntime}><Probe /></FinanceProvider>);
    await fireEvent.press(view.getByRole("button", { name: "Refresh Finance preview" }));
    expect(view.getByTestId("finance-revision").props.children).toBe(1);
    await view.rerender(<FinanceProvider ownerId="finance-mobile-owner" createRuntime={createRuntime}><Probe /></FinanceProvider>);
    expect(view.getByTestId("finance-owner").props.children).toBe("finance-mobile-owner");
    expect(createRuntime).toHaveBeenCalledTimes(1);
  });

  it("isolates repositories for separate composition roots", async () => {
    const first = createFinanceTestRuntime({ ownerId: "first-owner" }); const second = createFinanceTestRuntime({ ownerId: "second-owner" });
    await first.service.accounts.create(first.context, { name: "Wallet", accountType: "cash", currency: "USD" });
    expect((await first.service.accounts.list(first.context)).items).toHaveLength(1);
    expect((await second.service.accounts.list(second.context)).items).toHaveLength(0);
  });

  it("does not duplicate a user-triggered account under Strict Mode", async () => {
    let count = 0;
    function CreateOnce() { const { service, context } = useFinance(); return <View><Pressable accessibilityRole="button" accessibilityLabel="Create one account" onPress={() => void service.accounts.create(context, { name: "Wallet", accountType: "cash", currency: "USD" })}><Text>Create</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Read account count" onPress={() => void service.accounts.list(context).then((page) => { count = page.items.length; })}><Text>Read</Text></Pressable></View>; }
    const view = await render(<StrictMode><FinanceProvider createRuntime={() => createFinanceTestRuntime()}><CreateOnce /></FinanceProvider></StrictMode>);
    await fireEvent.press(view.getByRole("button", { name: "Create one account" })); await fireEvent.press(view.getByRole("button", { name: "Read account count" }));
    await waitFor(() => expect(count).toBe(1));
  });
});
