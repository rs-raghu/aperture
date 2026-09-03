import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { EducationProvider } from "@/features/education/providers/education-provider";
import { SetupScreen } from "@/features/education/screens/setup-screen";
import { CoursesScreen } from "@/features/education/screens/courses-screen";
import { AssignmentsScreen } from "@/features/education/screens/assignments-screen";
import { ExamsScreen } from "@/features/education/screens/exams-screen";
import { GradesScreen } from "@/features/education/screens/grades-screen";
import { AttendanceScreen } from "@/features/education/screens/attendance-screen";
import { StudySessionsScreen } from "@/features/education/screens/study-sessions-screen";
import { OverviewScreen } from "@/features/education/screens/overview-screen";
import { createDeterministicEducationRuntime } from "@/features/education/testing/create-test-runtime";

const OWNER = "90000000-0000-4000-8000-000000000004";

describe("Education web workflow", () => {
  it("moves from empty setup through academic activity and updates the overview", async () => {
    const user = userEvent.setup();
    const runtime = createDeterministicEducationRuntime(OWNER);
    const createRuntime = () => runtime;
    const view = render(<EducationProvider ownerId={OWNER} createRuntime={createRuntime}><SetupScreen /></EducationProvider>);

    await user.type(screen.getByLabelText("Institution name *"), "Synthetic Learning Lab");
    await user.click(screen.getByRole("button", { name: "Create institution" }));
    expect((await screen.findAllByText("Synthetic Learning Lab")).length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByLabelText("Institution *"), screen.getByRole("option", { name: "Synthetic Learning Lab" }));
    await user.type(screen.getByLabelText("Program name *"), "Structured Studies");
    fireEvent.change(screen.getByLabelText("Start date *", { selector: "input#programStart" }), { target: { value: "2026-08-01" } });
    await user.click(screen.getByRole("button", { name: "Create program" }));
    expect((await screen.findAllByText("Structured Studies")).length).toBeGreaterThan(0);

    await user.selectOptions(screen.getByLabelText("Program *"), screen.getByRole("option", { name: "Structured Studies" }));
    await user.type(screen.getByLabelText("Semester name *"), "Autumn Term");
    await user.type(screen.getByLabelText("Academic year *"), "2026–27");
    fireEvent.change(screen.getByLabelText("Start date *", { selector: "input#semesterStarts" }), { target: { value: "2026-08-01" } });
    fireEvent.change(screen.getByLabelText("End date *"), { target: { value: "2026-12-20" } });
    await user.click(screen.getByRole("button", { name: "Create semester" }));
    expect((await screen.findAllByText("Autumn Term")).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("button", { name: "Activate" }));

    view.rerender(<EducationProvider ownerId={OWNER} createRuntime={createRuntime}><CoursesScreen /></EducationProvider>);
    await screen.findByRole("heading", { name: "Create course" });
    const courseSemester = screen.getByLabelText("Semester *");
    await user.selectOptions(courseSemester, within(courseSemester).getByRole("option", { name: "Autumn Term" }));
    await user.type(screen.getByLabelText("Course name *"), "Systems Thinking");
    await user.type(screen.getByLabelText("Course code"), "SYS-101");
    await user.type(screen.getByLabelText("Credits"), "3");
    await user.click(screen.getByRole("button", { name: "Create course" }));
    await screen.findByText(/SYS-101/);

    view.rerender(<EducationProvider ownerId={OWNER} createRuntime={createRuntime}><AssignmentsScreen /></EducationProvider>);
    const assignmentCourse = screen.getByLabelText("Course *");
    await user.selectOptions(assignmentCourse, await within(assignmentCourse).findByRole("option", { name: "Systems Thinking" }));
    await user.type(screen.getByLabelText("Title *"), "Model the system");
    fireEvent.change(screen.getByLabelText("Due date and time"), { target: { value: "2026-10-03T12:00" } });
    await user.type(screen.getByLabelText("Maximum score"), "100");
    await user.type(screen.getByLabelText("Weight (%)"), "20");
    await user.click(screen.getByRole("button", { name: "Create assignment" }));
    await screen.findByRole("heading", { name: "Model the system" });
    await user.click(screen.getByRole("button", { name: "Submit" }));
    await user.click(await screen.findByRole("button", { name: "Complete" }));

    view.rerender(<EducationProvider ownerId={OWNER} createRuntime={createRuntime}><ExamsScreen /></EducationProvider>);
    const examCourse = screen.getByLabelText("Course *");
    await user.selectOptions(examCourse, await within(examCourse).findByRole("option", { name: "Systems Thinking" }));
    await user.type(screen.getByLabelText("Exam name *"), "Concept review");
    fireEvent.change(screen.getByLabelText("Starts *"), { target: { value: "2026-11-01T10:00" } });
    fireEvent.change(screen.getByLabelText("Ends *"), { target: { value: "2026-11-01T11:00" } });
    await user.type(screen.getByLabelText("Maximum marks"), "100");
    await user.click(screen.getByRole("button", { name: "Schedule exam" }));
    await screen.findByRole("heading", { name: "Concept review" });

    view.rerender(<EducationProvider ownerId={OWNER} createRuntime={createRuntime}><GradesScreen /></EducationProvider>);
    const gradeCourse = screen.getByLabelText("Course");
    await user.selectOptions(gradeCourse, await within(gradeCourse).findByRole("option", { name: "Systems Thinking" }));
    await user.type(await screen.findByLabelText("Grade title *"), "First assessment");
    await user.type(screen.getByLabelText("Score earned *"), "90");
    await user.type(screen.getByLabelText("Maximum score *"), "100");
    await user.type(screen.getByLabelText("Grade points"), "3.7");
    await user.type(screen.getByLabelText("Weight (%)"), "20");
    await user.click(screen.getByRole("button", { name: "Record grade" }));
    await screen.findByText("First assessment");

    view.rerender(<EducationProvider ownerId={OWNER} createRuntime={createRuntime}><AttendanceScreen /></EducationProvider>);
    const attendanceCourse = screen.getByLabelText("Course");
    await user.selectOptions(attendanceCourse, await within(attendanceCourse).findByRole("option", { name: "Systems Thinking" }));
    fireEvent.change(await screen.findByLabelText("Session date *"), { target: { value: "2026-09-02" } });
    await user.click(screen.getByRole("button", { name: "Record attendance" }));
    await screen.findByText("100.00%");

    view.rerender(<EducationProvider ownerId={OWNER} createRuntime={createRuntime}><StudySessionsScreen /></EducationProvider>);
    const studyCourse = screen.getByLabelText("Course");
    await user.selectOptions(studyCourse, await within(studyCourse).findByRole("option", { name: "Systems Thinking" }));
    await user.type(await screen.findByLabelText("Session title *"), "Review systems");
    fireEvent.change(screen.getByLabelText("Planned start *"), { target: { value: "2026-09-04T10:00" } });
    await user.type(screen.getByLabelText("Planned minutes"), "45");
    await user.click(screen.getByRole("button", { name: "Schedule session" }));
    await screen.findByRole("heading", { name: "Review systems" });
    await user.click(screen.getByRole("button", { name: "Start" }));
    await user.click(await screen.findByRole("button", { name: "Complete" }));

    view.rerender(<EducationProvider ownerId={OWNER} createRuntime={createRuntime}><OverviewScreen /></EducationProvider>);
    await waitFor(() => expect(screen.getByText("Active courses").parentElement?.textContent).toContain("1"));
    expect(document.body.textContent).toContain("Autumn Term");
    expect(document.body.textContent).not.toContain("[object Object]");
  }, 30_000);
});
