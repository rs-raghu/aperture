import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { HealthProvider, HydrationScreen, MeasurementsScreen, SleepScreen } from "../src/features/health";
import { createHealthTestRuntime } from "../src/features/health/testing/create-test-runtime";

describe("Health mobile forms", () => {
  it("preserves invalid measurement input and shows readable validation", async () => {
    const view = await render(<HealthProvider createRuntime={() => createHealthTestRuntime()}><MeasurementsScreen /></HealthProvider>);
    await fireEvent.changeText(view.getByLabelText("Value"), "not-a-number");
    await fireEvent.changeText(view.getByLabelText("Observed at"), "2040-01-01T07:00:00Z");
    await fireEvent.press(view.getByRole("button", { name: "Record measurement" }));
    await waitFor(() => expect(view.getByText("Unable to continue")).toBeTruthy());
    expect(view.getByLabelText("Value").props.value).toBe("not-a-number");
    expect(view.queryByText("[object Object]")).toBeNull();
  });

  it("records a measurement through the real service and virtualized history", async () => {
    const view = await render(<HealthProvider createRuntime={() => createHealthTestRuntime()}><MeasurementsScreen /></HealthProvider>);
    await fireEvent.changeText(view.getByLabelText("Value"), "72.5");
    await fireEvent.changeText(view.getByLabelText("Observed at"), "2040-01-01T07:00:00Z");
    await fireEvent.press(view.getByRole("button", { name: "Record measurement" }));
    await waitFor(() => expect(view.getByText("72.5 kilogram")).toBeTruthy());
    expect(view.getByLabelText("Health measurement records")).toBeTruthy();
  });

  it("shows an ordered-time error and keeps sleep form values", async () => {
    const view = await render(<HealthProvider createRuntime={() => createHealthTestRuntime()}><SleepScreen /></HealthProvider>);
    await fireEvent.changeText(view.getByLabelText("Sleep started at"), "2040-01-01T08:00:00Z");
    await fireEvent.changeText(view.getByLabelText("Sleep ended at"), "2040-01-01T07:00:00Z");
    await fireEvent.press(view.getByRole("button", { name: "Record sleep" }));
    await waitFor(() => expect(view.getAllByText(/earlier than start/i).length).toBeGreaterThan(0));
    expect(view.getByLabelText("Sleep started at").props.value).toBe("2040-01-01T08:00:00Z");
  });

  it("records hydration and displays the shared-service total", async () => {
    const view = await render(<HealthProvider createRuntime={() => createHealthTestRuntime()}><HydrationScreen /></HealthProvider>);
    await fireEvent.changeText(view.getByLabelText("Volume in milliliters"), "350");
    await fireEvent.changeText(view.getByLabelText("Hydration consumed at"), "2040-01-01T07:30:00Z");
    await fireEvent.press(view.getByRole("button", { name: "Record hydration" }));
    await waitFor(() => expect(view.getByText("0.35 liter")).toBeTruthy());
    expect(view.getByLabelText("Hydration records")).toBeTruthy();
  });
});
