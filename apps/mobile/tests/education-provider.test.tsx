import { StrictMode } from "react";
import { Pressable, Text, View } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { EducationProvider, useEducation } from "../src/features/education";
import { createEducationTestRuntime } from "../src/features/education/testing/create-test-runtime";

function Probe() {
  const runtime = useEducation();
  return (
    <View>
      <Text testID="owner">{runtime.context.ownerId}</Text>
      <Text testID="service">{String(Object.isFrozen(runtime.service))}</Text>
      <Text testID="revision">{runtime.revision}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="Refresh preview" onPress={runtime.refresh}><Text>Refresh</Text></Pressable>
    </View>
  );
}

describe("EducationProvider", () => {
  it("keeps its runtime stable across rerenders and injects the owner", async () => {
    const createRuntime = jest.fn((ownerId: string) => createEducationTestRuntime({ ownerId }));
    const view = await render(<EducationProvider ownerId="10000000-0000-4000-8000-000000000099" createRuntime={createRuntime}><Probe /></EducationProvider>);
    expect(view.getByTestId("owner").props.children).toBe("10000000-0000-4000-8000-000000000099");
    await fireEvent.press(view.getByRole("button", { name: "Refresh preview" }));
    expect(view.getByTestId("revision").props.children).toBe(1);
    await view.rerender(<EducationProvider ownerId="10000000-0000-4000-8000-000000000099" createRuntime={createRuntime}><Probe /></EducationProvider>);
    expect(createRuntime).toHaveBeenCalledTimes(1);
  });

  it("isolates separate provider instances and remounts", async () => {
    const runtimes: unknown[] = [];
    const factory = jest.fn((ownerId: string) => {
      const runtime = createEducationTestRuntime({ ownerId });
      runtimes.push(runtime.service);
      return runtime;
    });
    const first = await render(<EducationProvider createRuntime={factory}><Probe /></EducationProvider>);
    await first.unmount();
    const second = await render(<EducationProvider createRuntime={factory}><Probe /></EducationProvider>);
    expect(runtimes[0]).not.toBe(runtimes[1]);
    expect(factory).toHaveBeenCalledTimes(2);
    await second.unmount();
  });

  it("does not duplicate a user-triggered record under Strict Mode", async () => {
    function CreateOnce() {
      const { service, context } = useEducation();
      const create = () => void service.createInstitution(context, { name: "Synthetic Institute", type: "university", status: "active" });
      const count = async () => (await service.listInstitutions(context)).items.length;
      return <View><Pressable accessibilityRole="button" accessibilityLabel="Create once" onPress={create}><Text>Create once</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Read count" onPress={() => void count().then((value) => { lastCount = value; })}><Text>Read count</Text></Pressable></View>;
    }
    let lastCount = 0;
    const view = await render(<StrictMode><EducationProvider createRuntime={() => createEducationTestRuntime()}><CreateOnce /></EducationProvider></StrictMode>);
    await fireEvent.press(view.getByRole("button", { name: "Create once" }));
    await waitFor(() => expect(view.getByRole("button", { name: "Create once" })).toBeTruthy());
    await fireEvent.press(view.getByRole("button", { name: "Read count" }));
    await waitFor(() => expect(lastCount).toBe(1));
  });
});
