import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { EducationProvider, OverviewScreen, educationNavigation, useEducation } from "../src/features/education";
import { createEducationTestRuntime } from "../src/features/education/testing/create-test-runtime";

function WorkflowHarness() {
  const { service, context } = useEducation();
  const [complete, setComplete] = useState(false);
  const [showOverview, setShowOverview] = useState(false);

  const run = async () => {
    const institution = await service.createInstitution(context, { name: "Synthetic Institute", type: "university", status: "active" });
    const program = await service.createProgram(context, { institutionId: institution.id, name: "Synthetic Degree", programType: "degree", startsOn: "2026-01-01", status: "active" });
    const semester = await service.createSemester(context, { programId: program.id, name: "Term One", academicYear: "2026", sequence: 1, startsOn: "2026-01-01", endsOn: "2026-12-31", status: "planned" });
    await service.activateSemester(context, semester.id);
    const course = await service.createCourse(context, { semesterId: semester.id, name: "Synthetic Systems", code: "SYN-101", credits: "3", deliveryMode: "online", status: "active" });
    const assignment = await service.createAssignment(context, { courseId: course.id, title: "Synthetic Assignment", dueAt: "2026-10-15T09:00:00Z", maximumScore: "100", weightPercentage: "50", priority: "normal", status: "assigned" });
    await service.submitAssignment(context, assignment.id);
    await service.markAssignmentComplete(context, assignment.id);
    const exam = await service.createExam(context, { courseId: course.id, title: "Synthetic Exam", examType: "final", scheduledStartsAt: "2026-11-01T09:00:00Z", scheduledEndsAt: "2026-11-01T11:00:00Z", maximumScore: "100", weightPercentage: "50", status: "scheduled" });
    await service.recordGrade(context, { courseId: course.id, semesterId: semester.id, sourceType: "assignment", assignmentId: assignment.id, title: "Assignment result", scoreEarned: "80", maximumScore: "100", gradePoints: "3.5", weightPercentage: "50", recordedAt: "2026-09-03T12:00:00Z" });
    await service.recordAttendance(context, { courseId: course.id, sessionDate: "2026-09-03", status: "present", source: "manual", scheduledDurationMinutes: 60, attendedDurationMinutes: 60 });
    const study = await service.scheduleStudySession(context, { courseId: course.id, title: "Synthetic Study", plannedStartsAt: "2026-09-03T13:00:00Z", plannedDurationMinutes: 45, actualDurationMinutes: 45, method: "practice", status: "scheduled" });
    await service.startStudySession(context, study.id);
    await service.completeStudySession(context, study.id);
    expect(exam.status).toBe("scheduled");
    setComplete(true);
  };

  if (showOverview) return <OverviewScreen />;
  return (
    <View>
      <Pressable accessibilityRole="button" accessibilityLabel="Run Education workflow" onPress={() => void run()}><Text>Run workflow</Text></Pressable>
      {complete ? <>
        <Text>Workflow complete</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Navigate to overview" onPress={() => setShowOverview(true)}><Text>Navigate to overview</Text></Pressable>
      </> : null}
    </View>
  );
}

describe("Education mobile workflow", () => {
  it("uses the real service and memory adapter across navigation", async () => {
    const runtime = createEducationTestRuntime();
    const view = await render(<EducationProvider createRuntime={() => runtime}><WorkflowHarness /></EducationProvider>);
    await fireEvent.press(view.getByRole("button", { name: "Run Education workflow" }));
    await view.findByText("Workflow complete");
    await fireEvent.press(view.getByRole("button", { name: "Navigate to overview" }));
    await waitFor(() => expect(view.getByText("Synthetic Assignment")).toBeTruthy());
    expect(view.getByText("Term One")).toBeTruthy();
    expect(view.getAllByText("3.50").length).toBeGreaterThan(0);
    expect(view.getByText("1/1")).toBeTruthy();
    expect(view.getByText("45 min")).toBeTruthy();
  });

  it("renders an explicit empty state with setup navigation", async () => {
    const view = await render(<EducationProvider createRuntime={() => createEducationTestRuntime()}><OverviewScreen /></EducationProvider>);
    await view.findByText("Your Education space is empty");
    expect(view.getByRole("button", { name: "Start setup" })).toBeTruthy();
  });

  it("publishes seven local links plus the overview route", () => {
    expect(educationNavigation).toHaveLength(7);
    expect(new Set(educationNavigation.map((item) => item.href)).size).toBe(7);
  });
});
