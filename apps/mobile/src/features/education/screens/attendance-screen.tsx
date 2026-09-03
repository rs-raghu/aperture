import { useCallback, useState } from "react";
import { Alert } from "react-native";
import type { Course } from "@aperture/education";
import { ActionButton, ChoiceField, EmptyState, ErrorBanner, LoadingState, Metric, PageHeader, Panel, PreviewNotice, RecordCard, RecordList, Screen, TextField } from "../components/ui";
import { useEducationAction } from "../hooks/use-education-action";
import { useEducationQuery } from "../hooks/use-education-query";
import { useEducation } from "../providers/education-provider";
import { formatDate } from "../view-models/formatting";

export function AttendanceScreen() {
  const { service, context } = useEducation();
  const [courseId, setCourseId] = useState("");
  const load = useCallback(async () => (await service.listCourses(context)).items, [service, context]);
  const courses = useEducationQuery(load);
  return (
    <Screen testID="attendance-screen">
      <PageHeader title="Attendance" description="Record course sessions and read exact totals from the existing attendance calculation." />
      <PreviewNotice />
      <Panel title="Choose a course"><ChoiceField label="Course" value={courseId} options={(courses.data ?? []).map((item) => ({ value: item.id, label: item.name }))} onChange={setCourseId} /></Panel>
      <ErrorBanner error={courses.error} />
      {courses.loading ? <LoadingState /> : !courseId ? <EmptyState title="Choose a course" description={courses.data?.length ? "Select a course to record attendance." : "Create a course first."} href="/education/courses" action="Open courses" /> : <AttendanceWorkspace course={courses.data!.find((item) => item.id === courseId)!} />}
    </Screen>
  );
}

function AttendanceWorkspace({ course }: { readonly course: Course }) {
  const { service, context } = useEducation();
  const action = useEducationAction();
  const load = useCallback(async () => {
    const records = await service.listAttendanceByCourse(context, { courseId: course.id });
    if (records.items.length === 0) return { records: records.items, summary: undefined };
    const summary = await service.getCourseAttendanceSummary(context, course.id, "exclude");
    return { records: records.items, summary };
  }, [service, context, course.id]);
  const query = useEducationQuery(load);
  const remove = (id: string, date: string) => Alert.alert("Delete attendance record?", `The record for ${formatDate(date)} will be removed.`, [{ text: "Keep record", style: "cancel" }, { text: "Delete", style: "destructive", onPress: () => void action.execute(() => service.deleteAttendance(context, id)) }]);
  return (
    <>
      <AttendanceForm courseId={course.id} />
      <Panel title={`${course.name} summary`} description="Excused records are excluded by the selected service policy.">
        <Metric label="Attendance" value={query.data?.summary?.calculation.eligibleSessions ? `${query.data.summary.calculation.roundedAttendancePercentage}%` : "—"} detail={query.data?.summary ? `${query.data.summary.calculation.attendedSessions} attended of ${query.data.summary.calculation.eligibleSessions} eligible` : query.loading ? "Loading totals" : "No attendance recorded"} />
        <Metric label="Absent" value={String(query.data?.summary?.calculation.absentSessions ?? 0)} detail="Stored absence records" />
      </Panel>
      <Panel title="Attendance records">
        <ErrorBanner error={query.error ?? action.error} />
        {query.loading ? <LoadingState /> : !query.data?.records.length ? <EmptyState title="No attendance records" description="Record a class session with the form." /> : <RecordList items={query.data.records} keyExtractor={(record) => record.id} accessibilityLabel="Attendance records" renderItem={(record) => (
          <RecordCard title={formatDate(record.sessionDate)} status={record.status} details={[`${record.attendedDurationMinutes ?? "—"} attended minutes · ${record.source}`]}>
            <ActionButton label={`Delete attendance for ${formatDate(record.sessionDate)}`} tone="danger" pending={action.pending} onPress={() => remove(record.id, record.sessionDate)} />
          </RecordCard>
        )} />}
      </Panel>
    </>
  );
}

function AttendanceForm({ courseId }: { readonly courseId: string }) {
  const { service, context } = useEducation();
  const action = useEducationAction();
  const [sessionDate, setSessionDate] = useState("");
  const [status, setStatus] = useState<"present" | "absent" | "late" | "excused" | "cancelled">("present");
  const [scheduled, setScheduled] = useState("");
  const [attended, setAttended] = useState("");
  const submit = () => void action.execute(() => service.recordAttendance(context, { courseId, sessionDate, status, source: "manual", ...(scheduled ? { scheduledDurationMinutes: Number(scheduled) } : {}), ...(attended ? { attendedDurationMinutes: Number(attended) } : {}) })).then((saved) => { if (saved) { setSessionDate(""); setScheduled(""); setAttended(""); } });
  return (
    <Panel title="Record attendance" description="Only domain-defined attendance states are available.">
      <TextField name="sessionDate" label="Session date" required value={sessionDate} onChangeText={setSessionDate} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" error={action.error?.fieldErrors.sessionDate} />
      <ChoiceField label="Status" value={status} options={[{ value: "present", label: "Present" }, { value: "absent", label: "Absent" }, { value: "late", label: "Late" }, { value: "excused", label: "Excused" }, { value: "cancelled", label: "Cancelled" }]} onChange={setStatus} />
      <TextField name="scheduledDurationMinutes" label="Scheduled minutes" value={scheduled} onChangeText={setScheduled} keyboardType="number-pad" error={action.error?.fieldErrors.scheduledDurationMinutes} />
      <TextField name="attendedDurationMinutes" label="Attended minutes" value={attended} onChangeText={setAttended} keyboardType="number-pad" error={action.error?.fieldErrors.attendedDurationMinutes} />
      <ErrorBanner error={action.error} />
      <ActionButton label="Record attendance" onPress={submit} pending={action.pending} />
    </Panel>
  );
}
