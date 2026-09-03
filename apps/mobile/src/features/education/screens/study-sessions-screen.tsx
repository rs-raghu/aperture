import { useCallback, useState } from "react";
import { Alert } from "react-native";
import type { Course, StudySession } from "@aperture/education";
import { ActionButton, ChoiceField, EmptyState, ErrorBanner, LoadingState, Metric, PageHeader, Panel, PreviewNotice, RecordCard, RecordList, Screen, TextField } from "../components/ui";
import { useEducationAction } from "../hooks/use-education-action";
import { useEducationQuery } from "../hooks/use-education-query";
import { useEducation } from "../providers/education-provider";
import { formatDateTime, toIsoTimestamp } from "../view-models/formatting";

export function StudySessionsScreen() {
  const { service, context } = useEducation();
  const [courseId, setCourseId] = useState("");
  const load = useCallback(async () => (await service.listCourses(context)).items, [service, context]);
  const courses = useEducationQuery(load);
  return (
    <Screen testID="study-sessions-screen">
      <PageHeader title="Study sessions" description="Schedule focused work and use the service clock for lifecycle timestamps." />
      <PreviewNotice />
      <Panel title="Choose a course"><ChoiceField label="Course" value={courseId} options={(courses.data ?? []).map((item) => ({ value: item.id, label: item.name }))} onChange={setCourseId} /></Panel>
      <ErrorBanner error={courses.error} />
      {courses.loading ? <LoadingState /> : !courseId ? <EmptyState title="Choose a course" description={courses.data?.length ? "Select a course to plan study sessions." : "Create a course first."} href="/education/courses" action="Open courses" /> : <StudyWorkspace course={courses.data!.find((item) => item.id === courseId)!} />}
    </Screen>
  );
}

function StudyWorkspace({ course }: { readonly course: Course }) {
  const { service, context, clock } = useEducation();
  const action = useEducationAction();
  const load = useCallback(async () => {
    const year = clock.now().slice(0, 4);
    const [sessions, summary] = await Promise.all([
      service.listStudySessionsByCourse(context, { courseId: course.id }),
      service.getStudyTimeSummary(context, { courseId: course.id, range: { startsOn: `${year}-01-01`, endsOn: `${year}-12-31` } }),
    ]);
    return { sessions: sessions.items, summary };
  }, [service, context, clock, course.id]);
  const query = useEducationQuery(load);
  const cancel = (session: StudySession) => Alert.alert("Cancel study session?", session.title, [{ text: "Keep session", style: "cancel" }, { text: "Cancel session", style: "destructive", onPress: () => void action.execute(() => service.cancelStudySession(context, session.id)) }]);
  return (
    <>
      <StudyForm courseId={course.id} />
      <Panel title={`${course.name} summary`} description="Completed sessions without stored actual duration remain omitted.">
        <Metric label="Completed study" value={`${query.data?.summary.totalMinutes ?? 0} min`} detail={`${query.data?.summary.sessionCount ?? 0} sessions · ${query.data?.summary.omittedSessionCount ?? 0} missing duration`} />
      </Panel>
      <Panel title="Study session list">
        <ErrorBanner error={query.error ?? action.error} />
        {query.loading ? <LoadingState /> : !query.data?.sessions.length ? <EmptyState title="No study sessions" description="Schedule focused work with the form." /> : <RecordList items={query.data.sessions} keyExtractor={(session) => session.id} accessibilityLabel="Study session records" renderItem={(session) => (
          <RecordCard title={session.title} status={session.status} details={[`${formatDateTime(session.plannedStartsAt)} · ${session.method}`, `${session.plannedDurationMinutes ?? "—"} planned minutes${session.actualDurationMinutes !== undefined ? ` · ${session.actualDurationMinutes} actual` : ""}`]}>
            {session.status === "scheduled" ? <ActionButton label={`Start ${session.title}`} tone="secondary" pending={action.pending} onPress={() => void action.execute(() => service.startStudySession(context, session.id))} /> : null}
            {(session.status === "in_progress" || session.status === "paused") ? <ActionButton label={`Complete ${session.title}`} pending={action.pending} onPress={() => void action.execute(() => service.completeStudySession(context, session.id))} /> : null}
            {session.status !== "completed" && session.status !== "cancelled" ? <ActionButton label={`Cancel ${session.title}`} tone="danger" pending={action.pending} onPress={() => cancel(session)} /> : null}
          </RecordCard>
        )} />}
      </Panel>
    </>
  );
}

function StudyForm({ courseId }: { readonly courseId: string }) {
  const { service, context } = useEducation();
  const action = useEducationAction();
  const [title, setTitle] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [minutes, setMinutes] = useState("");
  const [method, setMethod] = useState<"reading" | "practice" | "review" | "lecture" | "group" | "other">("reading");
  const submit = () => void action.execute(() => service.scheduleStudySession(context, { courseId, title, plannedStartsAt: toIsoTimestamp(startsAt), ...(endsAt ? { plannedEndsAt: toIsoTimestamp(endsAt) } : {}), ...(minutes ? { plannedDurationMinutes: Number(minutes) } : {}), method, status: "scheduled" })).then((saved) => { if (saved) { setTitle(""); setStartsAt(""); setEndsAt(""); setMinutes(""); } });
  return (
    <Panel title="Schedule study" description="Use a zoned timestamp such as 2026-10-15T09:00:00Z.">
      <TextField name="title" label="Session title" required value={title} onChangeText={setTitle} error={action.error?.fieldErrors.title} />
      <TextField name="plannedStartsAt" label="Planned start" required value={startsAt} onChangeText={setStartsAt} placeholder="YYYY-MM-DDTHH:mm:ssZ" keyboardType="numbers-and-punctuation" error={action.error?.fieldErrors.plannedStartsAt} />
      <TextField name="plannedEndsAt" label="Planned end" value={endsAt} onChangeText={setEndsAt} placeholder="YYYY-MM-DDTHH:mm:ssZ" keyboardType="numbers-and-punctuation" error={action.error?.fieldErrors.plannedEndsAt} />
      <TextField name="plannedDurationMinutes" label="Planned minutes" value={minutes} onChangeText={setMinutes} keyboardType="number-pad" error={action.error?.fieldErrors.plannedDurationMinutes} />
      <ChoiceField label="Study method" value={method} options={[{ value: "reading", label: "Reading" }, { value: "practice", label: "Practice" }, { value: "review", label: "Review" }, { value: "lecture", label: "Lecture" }, { value: "group", label: "Group" }, { value: "other", label: "Other" }]} onChange={setMethod} />
      <ErrorBanner error={action.error} />
      <ActionButton label="Schedule session" onPress={submit} pending={action.pending} />
    </Panel>
  );
}
