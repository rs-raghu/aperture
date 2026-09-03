import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AttendanceScreen, EducationProvider, SetupScreen } from "../src/features/education";
import { createEducationTestRuntime } from "../src/features/education/testing/create-test-runtime";

async function createProgram(runtime: ReturnType<typeof createEducationTestRuntime>) {
  const institution = await runtime.service.createInstitution(runtime.context, {
    name: "Synthetic Institute",
    type: "university",
    status: "active",
  });
  return runtime.service.createProgram(runtime.context, {
    institutionId: institution.id,
    name: "Synthetic Degree",
    programType: "degree",
    startsOn: "2026-01-01",
    status: "active",
  });
}

describe("Education mobile forms", () => {
  it("shows a field error and preserves input after invalid submission", async () => {
    const view = await render(<EducationProvider createRuntime={() => createEducationTestRuntime()}><SetupScreen /></EducationProvider>);
    await fireEvent.changeText(view.getByLabelText("Institution name"), " ");
    await fireEvent.press(view.getByRole("button", { name: "Create institution" }));
    await waitFor(() => expect(view.getAllByText(/required|too small/i).length).toBeGreaterThan(0));
    expect(view.getByLabelText("Institution name").props.value).toBe(" ");
    expect(view.queryByText("[object Object]")).toBeNull();
  });

  it("creates an institution through the real service and refreshes the hierarchy", async () => {
    const view = await render(<EducationProvider createRuntime={() => createEducationTestRuntime()}><SetupScreen /></EducationProvider>);
    await fireEvent.changeText(view.getByLabelText("Institution name"), "Synthetic Institute");
    await fireEvent.press(view.getByRole("button", { name: "Create institution" }));
    await waitFor(() => expect(view.getAllByText("Synthetic Institute").length).toBeGreaterThan(0));
  });

  it("blocks a duplicate press while an action is pending", async () => {
    const runtime = createEducationTestRuntime();
    const original = runtime.service.createInstitution.bind(runtime.service);
    const createInstitution = jest.fn(async (...args: Parameters<typeof original>) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      return original(...args);
    });
    const delayedRuntime = { ...runtime, service: { ...runtime.service, createInstitution } };
    const view = await render(<EducationProvider createRuntime={() => delayedRuntime}><SetupScreen /></EducationProvider>);
    await fireEvent.changeText(view.getByLabelText("Institution name"), "Pending Institute");
    const button = view.getByRole("button", { name: "Create institution" });
    await fireEvent.press(button);
    await fireEvent.press(button);
    expect(createInstitution).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(view.getAllByText("Pending Institute").length).toBeGreaterThan(0));
  });

  it("keeps invalid numeric and calendar-date values visible beside field errors", async () => {
    const runtime = createEducationTestRuntime();
    await createProgram(runtime);
    const view = await render(<EducationProvider createRuntime={() => runtime}><SetupScreen /></EducationProvider>);
    await view.findByRole("radio", { name: "Program: Synthetic Degree" });
    await fireEvent.press(view.getByRole("radio", { name: "Program: Synthetic Degree" }));
    await fireEvent.changeText(view.getByLabelText("Semester name"), "Invalid Term");
    await fireEvent.changeText(view.getByLabelText("Academic year"), "2026");
    await fireEvent.changeText(view.getByLabelText("Sequence"), "not-a-number");
    await fireEvent.changeText(view.getAllByLabelText("Start date")[1], "2026-02-30");
    await fireEvent.changeText(view.getByLabelText("End date"), "2026-12-31");
    await fireEvent.press(view.getByRole("button", { name: "Create semester" }));
    await waitFor(() => expect(view.getAllByText(/invalid|number|date/i).length).toBeGreaterThan(0));
    expect(view.getByLabelText("Sequence").props.value).toBe("not-a-number");
    expect(view.getAllByLabelText("Start date")[1].props.value).toBe("2026-02-30");
    expect(view.queryByText("[object Object]")).toBeNull();
  });

  it("shows a clean attendance empty state before invoking the non-empty calculator", async () => {
    const runtime = createEducationTestRuntime();
    const program = await createProgram(runtime);
    const semester = await runtime.service.createSemester(runtime.context, {
      programId: program.id,
      name: "Term One",
      academicYear: "2026",
      sequence: 1,
      startsOn: "2026-01-01",
      endsOn: "2026-12-31",
      status: "planned",
    });
    await runtime.service.activateSemester(runtime.context, semester.id);
    await runtime.service.createCourse(runtime.context, {
      semesterId: semester.id,
      name: "Synthetic Systems",
      code: "SYN-101",
      credits: "3",
      deliveryMode: "online",
      status: "active",
    });
    const view = await render(<EducationProvider createRuntime={() => runtime}><AttendanceScreen /></EducationProvider>);
    await view.findByRole("radio", { name: "Course: Synthetic Systems" });
    await fireEvent.press(view.getByRole("radio", { name: "Course: Synthetic Systems" }));
    await view.findByText("No attendance records");
    expect(view.getByText("No attendance recorded")).toBeTruthy();
    expect(view.queryByText("Unable to continue")).toBeNull();
  });
});
