import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { EducationProvider } from "@/features/education/providers/education-provider";
import { SetupScreen } from "@/features/education/screens/setup-screen";
import { createDeterministicEducationRuntime } from "@/features/education/testing/create-test-runtime";

const OWNER = "90000000-0000-4000-8000-000000000003";

describe("Education forms", () => {
  it("shows readable field validation and never object stringification", async () => {
    const user = userEvent.setup();
    render(<EducationProvider ownerId={OWNER} createRuntime={createDeterministicEducationRuntime}><SetupScreen /></EducationProvider>);
    await user.click(screen.getByRole("button", { name: "Create institution" }));
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toContain("at least 1 character");
    expect(document.body.textContent).not.toContain("[object Object]");
  });

  it("preserves entered values after a domain validation failure", async () => {
    const user = userEvent.setup();
    render(<EducationProvider ownerId={OWNER} createRuntime={createDeterministicEducationRuntime}><SetupScreen /></EducationProvider>);
    const input = screen.getByLabelText("Institution name *");
    await user.type(input, "   ");
    await user.click(screen.getByRole("button", { name: "Create institution" }));
    expect((input as HTMLInputElement).value).toBe("   ");
  });

  it("prevents duplicate pending submissions", async () => {
    const runtime = createDeterministicEducationRuntime(OWNER);
    render(<EducationProvider ownerId={OWNER} createRuntime={() => runtime}><SetupScreen /></EducationProvider>);
    fireEvent.change(screen.getByLabelText("Institution name *"), { target: { value: "Synthetic Academy" } });
    const submit = screen.getByRole("button", { name: "Create institution" });
    fireEvent.click(submit); fireEvent.click(submit);
    await waitFor(async () => expect((await runtime.service.listInstitutions(runtime.context)).items).toHaveLength(1));
  });
});
