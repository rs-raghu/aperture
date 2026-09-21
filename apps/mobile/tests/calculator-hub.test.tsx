import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { allCalculatorPresentations, calculatorPresentationCategories } from "@aperture/calculators";
import { CalculatorHubScreen, CalculatorScreen, FinanceProvider } from "../src/features/finance";
import { createFinanceTestRuntime } from "../src/features/finance/testing/create-test-runtime";

describe("Calculator Hub mobile", () => {
  it("runs every registered example across all nine shared categories", () => {
    expect(allCalculatorPresentations).toHaveLength(38); expect(calculatorPresentationCategories).toHaveLength(9); expect(new Set(allCalculatorPresentations.map(({ id }) => id)).size).toBe(38); expect(new Set(allCalculatorPresentations.map(({ category }) => category)).size).toBe(9);
    for (const calculator of allCalculatorPresentations) { const parsed = calculator.inputSchema.safeParse(calculator.exampleInput); expect(parsed.success).toBe(true); if (parsed.success) expect(calculator.calculate(parsed.data)).toBeDefined(); }
  });

  it("searches by shared metadata and keeps favorites in one provider", async () => {
    const runtime = createFinanceTestRuntime(); const view = await render(<FinanceProvider createRuntime={() => runtime}><CalculatorHubScreen /></FinanceProvider>);
    await fireEvent.changeText(view.getByLabelText("Search calculators"), "simple interest");
    expect(view.getByText("Simple Interest")).toBeTruthy();
    await fireEvent.press(view.getByRole("button", { name: "☆ Add Simple Interest to favorites" }));
    expect(view.getByText("Favorites")).toBeTruthy();
  });

  it("runs GPA, saves two scenarios, and exposes card-based comparison choices", async () => {
    const view = await render(<FinanceProvider createRuntime={() => createFinanceTestRuntime()}><CalculatorScreen calculatorId="gpa" /></FinanceProvider>);
    await fireEvent.press(view.getByRole("button", { name: "Calculate" }));
    await waitFor(() => expect(view.getByText("Rounded GPA")).toBeTruthy());
    await fireEvent.changeText(view.getByLabelText("Scenario name"), "Baseline"); await fireEvent.press(view.getByRole("button", { name: "Save scenario" })); await view.findByText("Saved Baseline.");
    await fireEvent.changeText(view.getByLabelText("Scenario name"), "Alternative"); await fireEvent.press(view.getByRole("button", { name: "Save scenario" })); await view.findByText("Saved Alternative.");
    expect(view.getByText("Compare scenarios")).toBeTruthy(); expect(view.getByLabelText("First scenario: Baseline")).toBeTruthy(); expect(view.queryByText("[object Object]")).toBeNull();
  });

  it("persists a Finance calculator scenario through the repository", async () => {
    const runtime = createFinanceTestRuntime(); const view = await render(<FinanceProvider createRuntime={() => runtime}><CalculatorScreen calculatorId="simple-interest" /></FinanceProvider>);
    await fireEvent.press(view.getByRole("button", { name: "Calculate" })); await fireEvent.changeText(view.getByLabelText("Scenario name"), "Mobile baseline"); await fireEvent.press(view.getByRole("button", { name: "Save scenario" }));
    await view.findByText("Saved Mobile baseline.");
    expect((await runtime.service.scenarios.list(runtime.context, { calculatorId: "simple-interest" })).items).toHaveLength(1);
  });
});
