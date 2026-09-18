import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { FinanceProvider, useFinance } from "@/features/finance/providers/finance-provider";
import { createDeterministicFinanceRuntime } from "@/features/finance/testing/create-test-runtime";

const OWNER_A = "finance-web-owner-a";
const OWNER_B = "finance-web-owner-b";

function Probe() {
  const current = useFinance();
  const [first] = useState(current.service);
  const [count, setCount] = useState(0);
  return <><output aria-label="finance owner">{current.context.ownerId}</output><output aria-label="finance stable">{String(first === current.service)}</output><button onClick={() => setCount((value) => value + 1)}>Rerender {count}</button></>;
}

describe("FinanceProvider", () => {
  it("keeps one service across rerenders and injects the owner", async () => {
    const user = userEvent.setup();
    render(<FinanceProvider ownerId={OWNER_A} createRuntime={createDeterministicFinanceRuntime}><Probe /></FinanceProvider>);
    await user.click(screen.getByRole("button", { name: /Rerender/ }));
    expect(screen.getByLabelText("finance owner").textContent).toBe(OWNER_A);
    expect(screen.getByLabelText("finance stable").textContent).toBe("true");
  });

  it("isolates repository data between provider runtimes", async () => {
    const first = createDeterministicFinanceRuntime(OWNER_A);
    const second = createDeterministicFinanceRuntime(OWNER_B);
    await first.service.accounts.create(first.context, { name: "Checking", accountType: "bank", currency: "USD" });
    expect((await first.service.accounts.list(first.context)).items).toHaveLength(1);
    expect((await second.service.accounts.list(second.context)).items).toHaveLength(0);
  });
});
