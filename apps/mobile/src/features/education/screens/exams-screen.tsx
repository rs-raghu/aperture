import { useCallback, useMemo, useState } from "react";
import type { Course, Exam } from "@aperture/education";
import { ActionButton, ChoiceField, EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, PreviewNotice, RecordCard, RecordList, Screen, TextField } from "../components/ui";
import { useEducationAction } from "../hooks/use-education-action";
import { useEducationQuery } from "../hooks/use-education-query";
import { useEducation } from "../providers/education-provider";
import { formatDateTime, toIsoTimestamp } from "../view-models/formatting";

interface ExamData { readonly courses: readonly Course[]; readonly exams: readonly Exam[]; }

export function ExamsScreen() {
  const { service, context } = useEducation();
  const action = useEducationAction();
  const load = useCallback(async (): Promise<ExamData> => {
    const [courses, exams] = await Promise.all([service.listCourses(context), service.listExams(context)]);
    return { courses: courses.items, exams: exams.items };
  }, [service, context]);
  const query = useEducationQuery(load);
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<Exam | null>(null);
  const visible = useMemo(() => (query.data?.exams ?? []).filter((item) => (!courseFilter || item.courseId === courseFilter) && (!statusFilter || item.status === statusFilter)), [query.data, courseFilter, statusFilter]);
  const courseName = (id: string) => query.data?.courses.find((item) => item.id === id)?.name ?? "Unknown course";
  return (
    <Screen testID="exams-screen">
      <PageHeader title="Exams" description="Plan assessments and complete them through the Education service lifecycle." />
      <PreviewNotice />
      <ExamForm key={editing?.id ?? "new"} courses={query.data?.courses ?? []} editing={editing} onDone={() => setEditing(null)} />
      <Panel title="Exam schedule">
        <ChoiceField label="Course filter" value={courseFilter} options={[{ value: "", label: "All" }, ...(query.data?.courses ?? []).map((item) => ({ value: item.id, label: item.name }))]} onChange={setCourseFilter} />
        <ChoiceField label="Status filter" value={statusFilter} options={[{ value: "", label: "All" }, { value: "scheduled", label: "Scheduled" }, { value: "completed", label: "Completed" }, { value: "cancelled", label: "Cancelled" }]} onChange={setStatusFilter} />
        <ErrorBanner error={query.error ?? action.error} />
        {query.loading ? <LoadingState /> : !visible.length ? <EmptyState title="No exams found" description={query.data?.courses.length ? "Schedule an exam or change the filters." : "Create a course first."} href="/education/courses" action="Open courses" /> : <RecordList items={visible} keyExtractor={(item) => item.id} accessibilityLabel="Exam records" renderItem={(item) => (
          <RecordCard title={item.title} status={item.status} details={[`${courseName(item.courseId)} · ${item.examType}`, `${formatDateTime(item.scheduledStartsAt)} → ${formatDateTime(item.scheduledEndsAt)}`, `${item.maximumScore ?? "—"} maximum${item.weightPercentage ? ` · ${item.weightPercentage}% weight` : ""}`]}>
            {item.status === "scheduled" ? <ActionButton label={`Edit ${item.title}`} tone="secondary" onPress={() => setEditing(item)} /> : null}
            {item.status === "scheduled" ? <ActionButton label={`Complete ${item.title}`} pending={action.pending} onPress={() => void action.execute(() => service.completeExam(context, item.id))} /> : null}
          </RecordCard>
        )} />}
      </Panel>
    </Screen>
  );
}

function ExamForm({ courses, editing, onDone }: { readonly courses: readonly Course[]; readonly editing: Exam | null; readonly onDone: () => void }) {
  const { service, context } = useEducation();
  const action = useEducationAction();
  const [courseId, setCourseId] = useState(editing?.courseId ?? "");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [examType, setExamType] = useState<"quiz" | "midterm" | "final" | "practical" | "oral" | "other">(editing?.examType ?? "quiz");
  const [start, setStart] = useState(editing?.scheduledStartsAt ?? "");
  const [end, setEnd] = useState(editing?.scheduledEndsAt ?? "");
  const [maximumScore, setMaximumScore] = useState(editing?.maximumScore ?? "");
  const [weight, setWeight] = useState(editing?.weightPercentage ?? "");
  const submit = () => void (editing
    ? action.execute(() => service.updateExam(context, { id: editing.id, title, examType, scheduledStartsAt: toIsoTimestamp(start), scheduledEndsAt: toIsoTimestamp(end), ...(maximumScore ? { maximumScore } : {}), ...(weight ? { weightPercentage: weight } : {}) }))
    : action.execute(() => service.createExam(context, { courseId, title, examType, scheduledStartsAt: toIsoTimestamp(start), scheduledEndsAt: toIsoTimestamp(end), ...(maximumScore ? { maximumScore } : {}), ...(weight ? { weightPercentage: weight } : {}), status: "scheduled" })))
    .then((saved) => { if (saved) { setTitle(""); setStart(""); setEnd(""); setMaximumScore(""); setWeight(""); onDone(); } });
  return (
    <Panel title={editing ? "Edit exam" : "Schedule exam"} description="End time must not precede the start.">
      {!editing ? <ChoiceField label="Course" required value={courseId} options={courses.map((item) => ({ value: item.id, label: item.name }))} onChange={setCourseId} error={action.error?.fieldErrors.courseId} /> : null}
      <TextField name="title" label="Exam name" required value={title} onChangeText={setTitle} error={action.error?.fieldErrors.title} />
      <ChoiceField label="Exam type" value={examType} options={[{ value: "quiz", label: "Quiz" }, { value: "midterm", label: "Midterm" }, { value: "final", label: "Final" }, { value: "practical", label: "Practical" }, { value: "oral", label: "Oral" }, { value: "other", label: "Other" }]} onChange={setExamType} />
      <TextField name="scheduledStartsAt" label="Starts" required value={start} onChangeText={setStart} placeholder="YYYY-MM-DDTHH:mm:ssZ" keyboardType="numbers-and-punctuation" error={action.error?.fieldErrors.scheduledStartsAt} />
      <TextField name="scheduledEndsAt" label="Ends" required value={end} onChangeText={setEnd} placeholder="YYYY-MM-DDTHH:mm:ssZ" keyboardType="numbers-and-punctuation" error={action.error?.fieldErrors.scheduledEndsAt} />
      <TextField name="maximumScore" label="Maximum marks" value={maximumScore} onChangeText={setMaximumScore} keyboardType="decimal-pad" error={action.error?.fieldErrors.maximumScore} />
      <TextField name="weightPercentage" label="Weight (%)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" error={action.error?.fieldErrors.weightPercentage} />
      <ErrorBanner error={action.error} />
      <ActionButton label={editing ? "Save exam" : "Schedule exam"} onPress={submit} pending={action.pending} disabled={!editing && !courses.length} />
      {editing ? <ActionButton label="Cancel editing" tone="secondary" onPress={onDone} /> : null}
    </Panel>
  );
}
