import { fireEvent, render } from "@testing-library/react-native";
import {
  AssignmentsScreen,
  EducationProvider,
  ExamsScreen,
} from "../src/features/education";
import { createEducationTestRuntime } from "../src/features/education/testing/create-test-runtime";

async function createCourse(runtime: ReturnType<typeof createEducationTestRuntime>) {
  const institution = await runtime.service.createInstitution(runtime.context, {
    name: "Synthetic Institute",
    type: "university",
    status: "active",
  });
  const program = await runtime.service.createProgram(runtime.context, {
    institutionId: institution.id,
    name: "Synthetic Degree",
    programType: "degree",
    startsOn: "2026-01-01",
    status: "active",
  });
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
  return runtime.service.createCourse(runtime.context, {
    semesterId: semester.id,
    name: "Synthetic Systems",
    code: "SYN-101",
    credits: "3",
    deliveryMode: "online",
    status: "active",
  });
}

describe("Education mobile editing workflows", () => {
  it("edits an eligible assignment through the real service", async () => {
    const runtime = createEducationTestRuntime();
    const course = await createCourse(runtime);
    await runtime.service.createAssignment(runtime.context, {
      courseId: course.id,
      title: "Synthetic Assignment",
      dueAt: "2026-10-15T09:00:00Z",
      priority: "normal",
      status: "assigned",
    });
    const view = await render(<EducationProvider createRuntime={() => runtime}><AssignmentsScreen /></EducationProvider>);
    await view.findByRole("button", { name: "Edit Synthetic Assignment" });
    await fireEvent.press(view.getByRole("button", { name: "Edit Synthetic Assignment" }));
    await fireEvent.changeText(view.getByLabelText("Title"), "Edited Synthetic Assignment");
    await fireEvent.press(view.getByRole("button", { name: "Save assignment" }));
    await view.findByText("Edited Synthetic Assignment");
  });

  it("edits a scheduled exam through the real service", async () => {
    const runtime = createEducationTestRuntime();
    const course = await createCourse(runtime);
    await runtime.service.createExam(runtime.context, {
      courseId: course.id,
      title: "Synthetic Exam",
      examType: "final",
      scheduledStartsAt: "2026-11-01T09:00:00Z",
      scheduledEndsAt: "2026-11-01T11:00:00Z",
      status: "scheduled",
    });
    const view = await render(<EducationProvider createRuntime={() => runtime}><ExamsScreen /></EducationProvider>);
    await view.findByRole("button", { name: "Edit Synthetic Exam" });
    await fireEvent.press(view.getByRole("button", { name: "Edit Synthetic Exam" }));
    await fireEvent.changeText(view.getByLabelText("Exam name"), "Edited Synthetic Exam");
    await fireEvent.press(view.getByRole("button", { name: "Save exam" }));
    await view.findByText("Edited Synthetic Exam");
  });
});
