import { useCallback, useMemo, useState } from "react";
import type { Assignment, Course } from "@aperture/education";
import { ActionButton, ChoiceField, EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, PreviewNotice, RecordCard, RecordList, Screen, TextField } from "../components/ui";
import { useEducationAction } from "../hooks/use-education-action";
import { useEducationQuery } from "../hooks/use-education-query";
import { useEducation } from "../providers/education-provider";
import { formatDateTime, toIsoTimestamp } from "../view-models/formatting";

interface AssignmentData { readonly courses: readonly Course[]; readonly assignments: readonly Assignment[]; }

export function AssignmentsScreen() {
  const { service, context, clock } = useEducation();
  const action = useEducationAction();
  const load = useCallback(async (): Promise<AssignmentData> => {
    const [courses, assignments] = await Promise.all([service.listCourses(context), service.listAssignments(context)]);
    return { courses: courses.items, assignments: assignments.items };
  }, [service, context]);
  const query = useEducationQuery(load);
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<Assignment | null>(null);
  const visible = useMemo(() => (query.data?.assignments ?? []).filter((item) => (!courseFilter || item.courseId === courseFilter) && (!statusFilter || item.status === statusFilter)), [query.data, courseFilter, statusFilter]);
  const courseName = (id: string) => query.data?.courses.find((item) => item.id === id)?.name ?? "Unknown course";
  return (
    <Screen testID="assignments-screen">
      <PageHeader title="Assignments" description="Capture coursework and use service-defined submission and completion transitions." />
      <PreviewNotice />
      <AssignmentForm key={editing?.id ?? "new"} courses={query.data?.courses ?? []} editing={editing} onDone={() => setEditing(null)} />
      <Panel title="Assignment list" description="Overdue state uses the injected preview clock.">
        <ChoiceField label="Course filter" value={courseFilter} options={[{ value: "", label: "All" }, ...(query.data?.courses ?? []).map((item) => ({ value: item.id, label: item.name }))]} onChange={setCourseFilter} />
        <ChoiceField label="Status filter" value={statusFilter} options={[{ value: "", label: "All" }, ...(["draft", "assigned", "submitted", "completed", "cancelled"] as const).map((value) => ({ value, label: value }))]} onChange={setStatusFilter} />
        <ErrorBanner error={query.error ?? action.error} />
        {query.loading ? <LoadingState /> : !visible.length ? <EmptyState title="No assignments found" description={query.data?.courses.length ? "Create an assignment or change the filters." : "Create a course first."} href="/education/courses" action="Open courses" /> : <RecordList items={visible} keyExtractor={(item) => item.id} accessibilityLabel="Assignment records" renderItem={(item) => {
          const overdue = Boolean(item.dueAt && item.dueAt < clock.now() && item.status !== "completed" && item.status !== "cancelled");
          return (
            <RecordCard title={item.title} status={item.status} details={[`${courseName(item.courseId)} · ${item.weightPercentage ? `${item.weightPercentage}% weight` : "No weight"}`, item.dueAt ? `${overdue ? "Overdue" : "Due"} · ${formatDateTime(item.dueAt)}` : "No due date"]}>
              {item.status !== "completed" && item.status !== "cancelled" ? <ActionButton label={`Edit ${item.title}`} tone="secondary" onPress={() => setEditing(item)} /> : null}
              {(item.status === "draft" || item.status === "assigned") ? <ActionButton label={`Submit ${item.title}`} tone="secondary" pending={action.pending} onPress={() => void action.execute(() => service.submitAssignment(context, item.id))} /> : null}
              {item.status === "submitted" ? <ActionButton label={`Complete ${item.title}`} pending={action.pending} onPress={() => void action.execute(() => service.markAssignmentComplete(context, item.id))} /> : null}
            </RecordCard>
          );
        }} />}
      </Panel>
    </Screen>
  );
}

function AssignmentForm({ courses, editing, onDone }: { readonly courses: readonly Course[]; readonly editing: Assignment | null; readonly onDone: () => void }) {
  const { service, context } = useEducation();
  const action = useEducationAction();
  const [courseId, setCourseId] = useState(editing?.courseId ?? "");
  const [title, setTitle] = useState(editing?.title ?? "");
  const [dueAt, setDueAt] = useState(editing?.dueAt ?? "");
  const [maximumScore, setMaximumScore] = useState(editing?.maximumScore ?? "");
  const [weight, setWeight] = useState(editing?.weightPercentage ?? "");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">(editing?.priority ?? "normal");
  const submit = () => void (editing
    ? action.execute(() => service.updateAssignment(context, { id: editing.id, title, ...(dueAt ? { dueAt: toIsoTimestamp(dueAt) } : {}), ...(maximumScore ? { maximumScore } : {}), ...(weight ? { weightPercentage: weight } : {}), priority }))
    : action.execute(() => service.createAssignment(context, { courseId, title, ...(dueAt ? { dueAt: toIsoTimestamp(dueAt) } : {}), ...(maximumScore ? { maximumScore } : {}), ...(weight ? { weightPercentage: weight } : {}), priority, status: "assigned" })))
    .then((saved) => { if (saved) { setTitle(""); setDueAt(""); setMaximumScore(""); setWeight(""); onDone(); } });
  return (
    <Panel title={editing ? "Edit assignment" : "Create assignment"} description="Enter timestamps with a zone, for example 2026-10-15T09:00:00Z.">
      {!editing ? <ChoiceField label="Course" required value={courseId} options={courses.map((item) => ({ value: item.id, label: item.name }))} onChange={setCourseId} error={action.error?.fieldErrors.courseId} /> : null}
      <TextField name="title" label="Title" required value={title} onChangeText={setTitle} error={action.error?.fieldErrors.title} />
      <TextField name="dueAt" label="Due timestamp" value={dueAt} onChangeText={setDueAt} placeholder="YYYY-MM-DDTHH:mm:ssZ" keyboardType="numbers-and-punctuation" error={action.error?.fieldErrors.dueAt} />
      <ChoiceField label="Priority" value={priority} options={[{ value: "low", label: "Low" }, { value: "normal", label: "Normal" }, { value: "high", label: "High" }, { value: "urgent", label: "Urgent" }]} onChange={setPriority} />
      <TextField name="maximumScore" label="Maximum score" value={maximumScore} onChangeText={setMaximumScore} keyboardType="decimal-pad" error={action.error?.fieldErrors.maximumScore} />
      <TextField name="weightPercentage" label="Weight (%)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" error={action.error?.fieldErrors.weightPercentage} />
      <ErrorBanner error={action.error} />
      <ActionButton label={editing ? "Save assignment" : "Create assignment"} onPress={submit} pending={action.pending} disabled={!editing && !courses.length} />
      {editing ? <ActionButton label="Cancel editing" tone="secondary" onPress={onDone} /> : null}
    </Panel>
  );
}
