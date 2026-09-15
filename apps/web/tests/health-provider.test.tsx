import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { HealthProvider, useHealth } from "@/features/health/providers/health-provider";
import { createDeterministicHealthRuntime } from "@/features/health/testing/create-test-runtime";

const OWNER_A = "80000000-0000-4000-8000-000000000001";
const OWNER_B = "80000000-0000-4000-8000-000000000002";

function IdentityProbe() {
  const current = useHealth();
  const [first] = useState(current.service);
  const [renders, setRenders] = useState(0);
  return <><output aria-label="owner">{current.context.ownerId}</output><output aria-label="stable">{String(first === current.service)}</output><button onClick={() => setRenders((value) => value + 1)}>Rerender {renders}</button></>;
}

describe("HealthProvider", () => {
  it("keeps the service stable across rerenders and injects the owner", async () => {
    const user = userEvent.setup();
    render(<HealthProvider ownerId={OWNER_A} createRuntime={createDeterministicHealthRuntime}><IdentityProbe /></HealthProvider>);
    await user.click(screen.getByRole("button", { name: /Rerender/ }));
    expect(screen.getByLabelText("owner").textContent).toBe(OWNER_A);
    expect(screen.getByLabelText("stable").textContent).toBe("true");
  });

  it("isolates repository state between provider runtimes", async () => {
    const first = createDeterministicHealthRuntime(OWNER_A);
    const second = createDeterministicHealthRuntime(OWNER_B);
    await first.service.recordHydration(first.context, { volume: { value: "250", unit: "milliliter" }, consumedAt: "2040-01-01T07:00:00Z" });
    const [firstPage, secondPage] = await Promise.all([
      first.service.listHydrationEntries(first.context),
      second.service.listHydrationEntries(second.context),
    ]);
    expect(firstPage.items).toHaveLength(1);
    expect(secondPage.items).toHaveLength(0);
  });
});
