import { StrictMode } from "react";
import { Pressable, Text, View } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { HealthProvider, useHealth } from "../src/features/health";
import { createHealthTestRuntime } from "../src/features/health/testing/create-test-runtime";

function Probe() {
  const runtime = useHealth();
  return <View><Text testID="health-owner">{runtime.context.ownerId}</Text><Text testID="health-revision">{runtime.revision}</Text><Pressable accessibilityRole="button" accessibilityLabel="Refresh Health preview" onPress={runtime.refresh}><Text>Refresh</Text></Pressable></View>;
}

describe("HealthProvider", () => {
  it("keeps its runtime stable across rerenders and injects the owner", async () => {
    const createRuntime = jest.fn((ownerId: string) => createHealthTestRuntime({ ownerId }));
    const view = await render(<HealthProvider ownerId="83000000-0000-4000-8000-000000000010" createRuntime={createRuntime}><Probe /></HealthProvider>);
    await fireEvent.press(view.getByRole("button", { name: "Refresh Health preview" }));
    expect(view.getByTestId("health-revision").props.children).toBe(1);
    await view.rerender(<HealthProvider ownerId="83000000-0000-4000-8000-000000000010" createRuntime={createRuntime}><Probe /></HealthProvider>);
    expect(view.getByTestId("health-owner").props.children).toBe("83000000-0000-4000-8000-000000000010");
    expect(createRuntime).toHaveBeenCalledTimes(1);
  });

  it("isolates separate owners and composition roots", async () => {
    const first = createHealthTestRuntime({ ownerId: "84000000-0000-4000-8000-000000000010" });
    const second = createHealthTestRuntime({ ownerId: "85000000-0000-4000-8000-000000000010" });
    await first.service.recordHydration(first.context, { volume: { value: "250", unit: "milliliter" }, consumedAt: "2040-01-01T07:00:00Z" });
    expect((await first.service.listHydrationEntries(first.context)).items).toHaveLength(1);
    expect((await second.service.listHydrationEntries(second.context)).items).toHaveLength(0);
  });

  it("does not duplicate a user-triggered record under Strict Mode", async () => {
    let count = 0;
    function CreateOnce() { const { service, context } = useHealth(); return <View><Pressable accessibilityRole="button" accessibilityLabel="Record once" onPress={() => void service.recordHydration(context, { volume: { value: "100", unit: "milliliter" }, consumedAt: "2040-01-01T07:00:00Z" })}><Text>Record</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Read Health count" onPress={() => void service.listHydrationEntries(context).then((page) => { count = page.items.length; })}><Text>Read</Text></Pressable></View>; }
    const view = await render(<StrictMode><HealthProvider createRuntime={() => createHealthTestRuntime()}><CreateOnce /></HealthProvider></StrictMode>);
    await fireEvent.press(view.getByRole("button", { name: "Record once" }));
    await fireEvent.press(view.getByRole("button", { name: "Read Health count" }));
    await waitFor(() => expect(count).toBe(1));
  });
});
