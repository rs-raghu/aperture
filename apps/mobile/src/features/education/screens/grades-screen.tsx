import { useCallback, useState } from "react";
import { Alert } from "react-native";
import type { Assignment, Course, Exam, Semester } from "@aperture/education";
import { ActionButton, ChoiceField, EmptyState, ErrorBanner, LoadingState, Metric, PageHeader, Panel, PreviewNotice, RecordCard, RecordList, Screen, TextField } from "../components/ui";
import { useEducationAction } from "../hooks/use-education-action";
import { useEducationQuery } from "../hooks/use-education-query";
import { useEducation } from "../providers/education-provider";
import { formatDateTime } from "../view-models/formatting";

interface GradeData { readonly courses: readonly Course[]; readonly semesters: readonly Semester[]; readonly assignments: readonly Assignment[]; readonly exams: readonly Exam[]; }

export function GradesScreen() {
  const { service, context } = useEducation();
  const [courseId, setCourseId] = useState("");
  const load = useCallback(async (): Promise<GradeData> => {
    const [courses, semesters, assignments, exams] = await Promise.all([service.listCourses(context), service.listSemesters(context), service.listAssignments(context), service.listExams(context)]);
    return { courses: courses.items, semesters: semesters.items, assignments: assignments.items, exams: exams.items };
  }, [service, context]);
  const query = useEducationQuery(load);
  return (
    <Screen testID="grades-screen">
      <PageHeader title="Grades" description="Record exact decimal outcomes and read calculation results returned by the Education service." />
      <PreviewNotice />
      <Panel title="Choose a course">
        <ChoiceField label="Course" value={courseId} options={(query.data?.courses ?? []).map((item) => ({ value: item.id, label: item.name }))} onChange={setCourseId} />
      </Panel>
      <ErrorBanner error={query.error} />
      {query.loading ? <LoadingState /> : !courseId ? <EmptyState title="Choose a course" description={query.data?.courses.length ? "Select a course to record and review grades." : "Create a course first."} href="/education/courses" action="Open courses" /> : <GradeWorkspace courseId={courseId} data={query.data!} />}
    </Screen>
  );
}

function GradeWorkspace({ courseId, data }: { readonly courseId: string; readonly data: GradeData }) {
  const { service, context } = useEducation();
  const action = useEducationAction();
  const load = useCallback(async () => {
    const course = data.courses.find((item) => item.id === courseId);
    const [grades, performance] = await Promise.all([
      service.listGradesByCourse(context, { courseId }),
      service.getAcademicPerformanceSummary(context, course ? { semesterId: course.semesterId, gradePointScale: "4" } : { gradePointScale: "4" }),
    ]);
    return { grades: grades.items, performance, course };
  }, [service, context, courseId, data]);
  const query = useEducationQuery(load);
  const weighted = query.data?.performance.courseGrades.find((item) => item.courseId === courseId)?.weightedGrade;
  const confirmDelete = (id: string, title: string) => Alert.alert("Delete grade?", `${title} will be removed from this in-memory preview.`, [{ text: "Keep grade", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => void action.execute(() => service.deleteGrade(context, id)) }]);
  return (
    <>
      <GradeForm courseId={courseId} course={query.data?.course} assignments={data.assignments.filter((item) => item.courseId === courseId)} exams={data.exams.filter((item) => item.courseId === courseId)} />
      <Panel title="Calculated performance" description="React displays service outputs and performs no grade arithmetic.">
        <Metric label="Weighted course grade" value={weighted ? `${weighted.roundedCurrentGrade}%` : "—"} detail={weighted?.warnings.join(", ") || "Needs weighted grade records"} />
        <Metric label="Semester GPA" value={query.data?.performance.semesterGpa?.roundedGpa ?? "—"} detail="4-point configured scale" />
        <Metric label="CGPA" value={query.data?.performance.cumulativeGpa?.roundedCgpa ?? "—"} detail="Available graded semesters" />
      </Panel>
      <Panel title="Gradebook">
        <ErrorBanner error={query.error ?? action.error} />
        {query.loading ? <LoadingState /> : !query.data?.grades.length ? <EmptyState title="No grades recorded" description="Use the form to add a manual, assignment, or exam grade." /> : <RecordList items={query.data.grades} keyExtractor={(grade) => grade.id} accessibilityLabel="Grade records" renderItem={(grade) => (
          <RecordCard title={grade.title} details={[`${grade.scoreEarned} / ${grade.maximumScore}`, `${grade.gradePoints ?? "—"} points · ${grade.weightPercentage ? `${grade.weightPercentage}% weight` : "No weight"}`, `Recorded ${formatDateTime(grade.recordedAt)}`]}>
            <ActionButton label={`Delete grade ${grade.title}`} tone="danger" pending={action.pending} onPress={() => confirmDelete(grade.id, grade.title)} />
          </RecordCard>
        )} />}
      </Panel>
    </>
  );
}

function GradeForm({ courseId, course, assignments, exams }: { readonly courseId: string; readonly course?: Course; readonly assignments: readonly Assignment[]; readonly exams: readonly Exam[] }) {
  const { service, context, clock } = useEducation();
  const action = useEducationAction();
  const [sourceType, setSourceType] = useState<"manual" | "assignment" | "exam">("manual");
  const [sourceId, setSourceId] = useState("");
  const [title, setTitle] = useState("");
  const [score, setScore] = useState("");
  const [maximum, setMaximum] = useState("");
  const [points, setPoints] = useState("");
  const [weight, setWeight] = useState("");
  const sources = sourceType === "assignment" ? assignments : exams;
  const submit = () => void action.execute(() => service.recordGrade(context, { courseId, ...(course ? { semesterId: course.semesterId } : {}), sourceType, ...(sourceType === "assignment" ? { assignmentId: sourceId } : {}), ...(sourceType === "exam" ? { examId: sourceId } : {}), title, scoreEarned: score, maximumScore: maximum, ...(points ? { gradePoints: points } : {}), ...(weight ? { weightPercentage: weight } : {}), recordedAt: clock.now() })).then((saved) => { if (saved) { setTitle(""); setScore(""); setMaximum(""); setPoints(""); setWeight(""); setSourceId(""); } });
  return (
    <Panel title="Record grade" description="GPA appears only when explicit grade points and course credits exist.">
      <ChoiceField label="Source type" value={sourceType} options={[{ value: "manual", label: "Manual" }, { value: "assignment", label: "Assignment" }, { value: "exam", label: "Exam" }]} onChange={(value) => { setSourceType(value); setSourceId(""); }} />
      {sourceType !== "manual" ? <ChoiceField label={sourceType === "assignment" ? "Assignment" : "Exam"} required value={sourceId} options={sources.map((item) => ({ value: item.id, label: item.title }))} onChange={setSourceId} error={action.error?.fieldErrors[sourceType === "assignment" ? "assignmentId" : "examId"]} /> : null}
      <TextField name="title" label="Grade title" required value={title} onChangeText={setTitle} error={action.error?.fieldErrors.title} />
      <TextField name="scoreEarned" label="Score earned" required value={score} onChangeText={setScore} keyboardType="decimal-pad" error={action.error?.fieldErrors.scoreEarned} />
      <TextField name="maximumScore" label="Maximum score" required value={maximum} onChangeText={setMaximum} keyboardType="decimal-pad" error={action.error?.fieldErrors.maximumScore} />
      <TextField name="gradePoints" label="Grade points" value={points} onChangeText={setPoints} keyboardType="decimal-pad" hint="For example 3.75 on a 4-point scale." error={action.error?.fieldErrors.gradePoints} />
      <TextField name="weightPercentage" label="Weight (%)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" error={action.error?.fieldErrors.weightPercentage} />
      <ErrorBanner error={action.error} />
      <ActionButton label="Record grade" onPress={submit} pending={action.pending} />
    </Panel>
  );
}
