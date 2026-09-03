import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import type { Course, Semester } from "@aperture/education";
import { ActionButton, ChoiceField, EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, PreviewNotice, RecordCard, RecordList, Screen, TextField } from "../components/ui";
import { useEducationAction } from "../hooks/use-education-action";
import { useEducationQuery } from "../hooks/use-education-query";
import { useEducation } from "../providers/education-provider";
import { formatDate } from "../view-models/formatting";

interface CourseData { readonly semesters: readonly Semester[]; readonly courses: readonly Course[]; }

export function CoursesScreen() {
  const { service, context } = useEducation();
  const load = useCallback(async (): Promise<CourseData> => {
    const [semesters, courses] = await Promise.all([service.listSemesters(context), service.listCourses(context)]);
    return { semesters: semesters.items, courses: courses.items };
  }, [service, context]);
  const query = useEducationQuery(load);
  const action = useEducationAction();
  const [semesterFilter, setSemesterFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [editing, setEditing] = useState<Course | null>(null);
  const visible = useMemo(() => (query.data?.courses ?? []).filter((course) => (!semesterFilter || course.semesterId === semesterFilter) && (!statusFilter || course.status === statusFilter)), [query.data, semesterFilter, statusFilter]);
  const semesterName = (id: string) => query.data?.semesters.find((item) => item.id === id)?.name ?? "Unknown semester";
  const archive = (course: Course) => Alert.alert("Archive course?", `${course.name} remains stored but becomes inactive.`, [
    { text: "Keep course", style: "cancel" },
    { text: "Archive", style: "destructive", onPress: () => void action.execute(() => service.archiveCourse(context, course.id)) },
  ]);

  return (
    <Screen testID="courses-screen">
      <PageHeader title="Courses" description="Create and organize courses beneath an explicit semester." />
      <PreviewNotice />
      <CourseForm key={editing?.id ?? "new"} semesters={query.data?.semesters ?? []} editing={editing} onDone={() => setEditing(null)} />
      <Panel title="Course directory" description="Filter the stored course list without duplicating repository behavior.">
        <ChoiceField label="Semester filter" value={semesterFilter} options={[{ value: "", label: "All" }, ...(query.data?.semesters ?? []).map((item) => ({ value: item.id, label: item.name }))]} onChange={setSemesterFilter} />
        <ChoiceField label="Status filter" value={statusFilter} options={[{ value: "", label: "All" }, { value: "planned", label: "Planned" }, { value: "active", label: "Active" }, { value: "completed", label: "Completed" }, { value: "archived", label: "Archived" }]} onChange={setStatusFilter} />
        <ErrorBanner error={query.error ?? action.error} />
        {query.loading ? <LoadingState /> : !visible.length ? <EmptyState title="No courses found" description={query.data?.semesters.length ? "Create a course or change the filters." : "Complete setup before creating a course."} href="/education/setup" action="Open setup" /> : <RecordList items={visible} keyExtractor={(course) => course.id} accessibilityLabel="Course records" renderItem={(course) => (
          <RecordCard title={`${course.code ? `${course.code} · ` : ""}${course.name}`} status={course.status} details={[`${semesterName(course.semesterId)} · ${course.credits ? `${course.credits} credits` : "Credits not set"}`, `${course.instructor ?? "Instructor not set"} · ${course.deliveryMode.replaceAll("_", " ")}${course.startsOn ? ` · ${formatDate(course.startsOn)}` : ""}`]}>
            <ActionButton label={`Edit ${course.name}`} tone="secondary" onPress={() => setEditing(course)} />
            {course.status !== "archived" ? <ActionButton label={`Archive ${course.name}`} tone="danger" pending={action.pending} onPress={() => archive(course)} /> : null}
          </RecordCard>
        )} />}
      </Panel>
    </Screen>
  );
}

function CourseForm({ semesters, editing, onDone }: { readonly semesters: readonly Semester[]; readonly editing: Course | null; readonly onDone: () => void }) {
  const { service, context } = useEducation();
  const action = useEducationAction();
  const [semesterId, setSemesterId] = useState(editing?.semesterId ?? "");
  const [name, setName] = useState(editing?.name ?? "");
  const [code, setCode] = useState(editing?.code ?? "");
  const [credits, setCredits] = useState(editing?.credits ?? "");
  const [instructor, setInstructor] = useState(editing?.instructor ?? "");
  const [deliveryMode, setDeliveryMode] = useState<"in_person" | "online" | "hybrid" | "self_paced" | "other">(editing?.deliveryMode ?? "in_person");
  const [status, setStatus] = useState<"planned" | "active" | "completed">(editing?.status === "archived" ? "completed" : editing?.status ?? "active");
  const submit = () => void (editing
    ? action.execute(() => service.updateCourse(context, { id: editing.id, name: name || editing.name, ...(code ? { code } : {}), ...(credits ? { credits } : {}), ...(instructor ? { instructor } : {}), deliveryMode, status }))
    : action.execute(() => service.createCourse(context, { semesterId, name, ...(code ? { code } : {}), ...(credits ? { credits } : {}), ...(instructor ? { instructor } : {}), deliveryMode, status })))
    .then((saved) => { if (saved) { setName(""); setCode(""); setCredits(""); setInstructor(""); onDone(); } });
  return (
    <Panel title={editing ? "Edit course" : "Create course"} description={editing ? `Updating ${editing.name}.` : "Courses require an existing semester."}>
      {!editing ? <ChoiceField label="Semester" required value={semesterId} options={semesters.map((item) => ({ value: item.id, label: item.name }))} onChange={setSemesterId} error={action.error?.fieldErrors.semesterId} /> : null}
      <TextField name="code" label="Course code" value={code} onChangeText={setCode} error={action.error?.fieldErrors.code} />
      <TextField name="name" label="Course name" required value={name} onChangeText={setName} error={action.error?.fieldErrors.name} />
      <TextField name="credits" label="Credits" value={credits} onChangeText={setCredits} keyboardType="decimal-pad" hint="Use an exact decimal such as 3 or 3.5." error={action.error?.fieldErrors.credits} />
      <TextField name="instructor" label="Instructor" value={instructor} onChangeText={setInstructor} error={action.error?.fieldErrors.instructor} />
      <ChoiceField label="Delivery mode" value={deliveryMode} options={[{ value: "in_person", label: "In person" }, { value: "online", label: "Online" }, { value: "hybrid", label: "Hybrid" }, { value: "self_paced", label: "Self-paced" }, { value: "other", label: "Other" }]} onChange={setDeliveryMode} />
      <ChoiceField label="Status" value={status} options={[{ value: "planned", label: "Planned" }, { value: "active", label: "Active" }, { value: "completed", label: "Completed" }]} onChange={setStatus} />
      <ErrorBanner error={action.error} />
      <ActionButton label={editing ? "Save course" : "Create course"} onPress={submit} pending={action.pending} disabled={!editing && !semesters.length} />
      {editing ? <ActionButton label="Cancel editing" tone="secondary" onPress={onDone} /> : null}
    </Panel>
  );
}
