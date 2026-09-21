import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { allCalculatorPresentations, calculatorPresentationCategories } from "@aperture/calculators";
import { FinanceProvider } from "@/features/finance/providers/finance-provider";
import { CalculatorHubScreen } from "@/features/finance/screens/calculator-hub-screen";
import { CalculatorScreen } from "@/features/finance/screens/calculator-screen";
import { createDeterministicFinanceRuntime } from "@/features/finance/testing/create-test-runtime";

const OWNER = "calculator-web-owner";

describe("Calculator Hub", () => {
  it("registers every required calculator under all nine presentation categories", () => {
    expect(allCalculatorPresentations).toHaveLength(38);
    expect(new Set(allCalculatorPresentations.map(({ id }) => id)).size).toBe(38);
    expect(new Set(allCalculatorPresentations.map(({ category }) => category)).size).toBe(9);
    expect(calculatorPresentationCategories).toHaveLength(9);
    expect(allCalculatorPresentations.map(({ id }) => id)).toEqual(expect.arrayContaining(["gpa", "cgpa", "sip", "emi", "income-tax", "fire", "apy", "inflation-adjusted-value"]));
    for (const calculator of allCalculatorPresentations) {
      const parsed = calculator.inputSchema.safeParse(calculator.exampleInput);
      expect(parsed.success, calculator.id).toBe(true);
      if (parsed.success) expect(calculator.calculate(parsed.data), calculator.id).toBeDefined();
    }
  });

  it("searches, favorites, runs, remembers, and compares calculator scenarios", async () => {
    const user = userEvent.setup(); const runtime = createDeterministicFinanceRuntime(OWNER); const createRuntime = () => runtime;
    const view = render(<FinanceProvider ownerId={OWNER} createRuntime={createRuntime}><CalculatorHubScreen /></FinanceProvider>);
    await user.type(screen.getByLabelText("Search calculators"), "GPA");
    expect(screen.getByRole("link", { name: "GPA" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "SIP" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Add GPA to favorites" }));

    view.rerender(<FinanceProvider ownerId={OWNER} createRuntime={createRuntime}><CalculatorScreen calculatorId="gpa" /></FinanceProvider>);
    await user.click(screen.getByRole("button", { name: "Calculate" }));
    await waitFor(() => expect(document.body.textContent).toContain("Rounded GPA"));
    expect(document.body.textContent).toContain("9");
    await user.type(screen.getByLabelText("Scenario name"), "Baseline"); await user.click(screen.getByRole("button", { name: "Save scenario" })); await screen.findByText("Saved Baseline in this preview.");
    await user.type(screen.getByLabelText("Scenario name"), "Alternative"); await user.click(screen.getByRole("button", { name: "Save scenario" })); await screen.findByText("Saved Alternative in this preview.");
    const first = screen.getByLabelText("First scenario"); const second = screen.getByLabelText("Second scenario");
    await user.selectOptions(first, within(first).getByRole("option", { name: "Baseline" })); await user.selectOptions(second, within(second).getByRole("option", { name: "Alternative" }));
    expect(screen.getAllByRole("heading", { name: "Baseline" })).toHaveLength(1);
    expect(document.body.textContent).not.toContain("[object Object]");

    view.rerender(<FinanceProvider ownerId={OWNER} createRuntime={createRuntime}><CalculatorHubScreen /></FinanceProvider>);
    expect(screen.getByRole("heading", { name: "Favorites" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Recently used" })).toBeTruthy();
  });

  it("shows human-readable validation errors", async () => {
    const user = userEvent.setup();
    render(<FinanceProvider ownerId={OWNER} createRuntime={createDeterministicFinanceRuntime}><CalculatorScreen calculatorId="gpa" /></FinanceProvider>);
    const gradePoints = screen.getAllByLabelText(/Grade Points/)[0]!;
    await user.clear(gradePoints); await user.type(gradePoints, "20"); await user.click(screen.getByRole("button", { name: "Calculate" }));
    expect((await screen.findByRole("alert")).textContent).toContain("Grade points cannot exceed");
  });
});
