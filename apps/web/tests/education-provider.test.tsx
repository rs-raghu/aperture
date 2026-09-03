import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { EducationProvider, useEducation } from "@/features/education/providers/education-provider";
import { createDeterministicEducationRuntime } from "@/features/education/testing/create-test-runtime";

const OWNER_A = "90000000-0000-4000-8000-000000000001";
const OWNER_B = "90000000-0000-4000-8000-000000000002";

function IdentityProbe() {
  const current = useEducation();
  const [first] = useState(current.service);
  const [renders, setRenders] = useState(0);
  return <><output aria-label="owner">{current.context.ownerId}</output><output aria-label="stable">{String(first === current.service)}</output><button onClick={() => setRenders((value) => value + 1)}>Rerender {renders}</button></>;
}

describe("EducationProvider", () => {
  it("keeps the service stable across rerenders and injects the owner", async () => {
    const user = userEvent.setup();
    render(<EducationProvider ownerId={OWNER_A} createRuntime={createDeterministicEducationRuntime}><IdentityProbe /></EducationProvider>);
    await user.click(screen.getByRole("button", { name: /Rerender/ }));
    expect(screen.getByLabelText("owner").textContent).toBe(OWNER_A);
    expect(screen.getByLabelText("stable").textContent).toBe("true");
  });

  it("isolates repository state between provider instances", async () => {
    const runtimes = [createDeterministicEducationRuntime(OWNER_A), createDeterministicEducationRuntime(OWNER_B)];
    await runtimes[0]!.service.createInstitution(runtimes[0]!.context, { name: "Synthetic Academy", type: "other", status: "active" });
    const [first, second] = await Promise.all(runtimes.map((runtime) => runtime.service.listInstitutions(runtime.context)));
    expect(first?.items).toHaveLength(1);
    expect(second?.items).toHaveLength(0);
  });
});
