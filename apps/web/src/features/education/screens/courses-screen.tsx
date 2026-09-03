"use client";

import { useCallback, useMemo, useState, type FormEvent } from "react";
import type { Course, Semester } from "@aperture/education";
import { useEducation } from "../providers/education-provider";
import { useEducationAction } from "../hooks/use-education-action";
import { useEducationQuery } from "../hooks/use-education-query";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, SelectInput, StatusBadge, SubmitButton, TextInput, formatDate } from "../components/ui";

interface CourseData { readonly semesters: readonly Semester[]; readonly courses: readonly Course[]; }

export function CoursesScreen() {
  const { service, context } = useEducation();
  const load = useCallback(async (): Promise<CourseData> => {
    const [semesters, courses] = await Promise.all([service.listSemesters(context), service.listCourses(context)]);
    return { semesters: semesters.items, courses: courses.items };
  }, [service, context]);
  const query = useEducationQuery(load);
  const action = useEducationAction();
  const [semesterFilter, setSemesterFilter] = useState(""); const [statusFilter, setStatusFilter] = useState(""); const [editing, setEditing] = useState<Course | null>(null);
  const visible = useMemo(() => (query.data?.courses ?? []).filter((course) => (!semesterFilter || course.semesterId === semesterFilter) && (!statusFilter || course.status === statusFilter)), [query.data, semesterFilter, statusFilter]);
  const semesterName = (id: string) => query.data?.semesters.find((item) => item.id === id)?.name ?? "Unknown semester";

  return <><PageHeader eyebrow="Academic structure" title="Courses" description="Create and organize courses beneath an explicit semester. Grade and attendance calculations remain in the Education service." />
    <div className="grid grid-2">
      <CourseForm key={editing?.id ?? "new"} semesters={query.data?.semesters ?? []} editing={editing} onDone={() => setEditing(null)} />
      <Panel title="Course directory" description="Filter by semester or lifecycle status.">
        <div className="filters"><SelectInput name="courseSemesterFilter" label="Semester" value={semesterFilter} onChange={(event) => setSemesterFilter(event.target.value)}><option value="">All semesters</option>{query.data?.semesters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput><SelectInput name="courseStatusFilter" label="Status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option><option value="planned">Planned</option><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></SelectInput></div>
        <ErrorBanner error={query.error ?? action.error} />
        {query.loading ? <LoadingState /> : visible.length === 0 ? <EmptyState title="No courses found" description={query.data?.semesters.length ? "Create a course or change the filters." : "Complete Education setup before creating a course."} href="/education/setup" action="Open setup" /> : <ul className="record-list">{visible.map((course) => <li className="record-card" key={course.id}><div><h3>{course.code ? `${course.code} · ` : ""}{course.name}</h3><p>{semesterName(course.semesterId)} · {course.credits ? `${course.credits} credits` : "Credits not set"}</p><p>{course.instructor ?? "Instructor not set"} · {course.deliveryMode.replaceAll("_", " ")}{course.startsOn ? ` · ${formatDate(course.startsOn)}` : ""}</p></div><div className="record-actions"><StatusBadge value={course.status} /><button className="button button-small button-secondary" onClick={() => setEditing(course)}>Edit</button>{course.status !== "archived" && <button className="button button-small button-danger" disabled={action.pending} onClick={() => { if (window.confirm(`Archive ${course.name}?`)) void action.execute(() => service.archiveCourse(context, course.id)); }}>Archive</button>}</div></li>)}</ul>}
      </Panel>
    </div>
  </>;
}

function CourseForm({ semesters, editing, onDone }: { readonly semesters: readonly Semester[]; readonly editing: Course | null; readonly onDone: () => void }) {
  const { service, context } = useEducation(); const action = useEducationAction();
  const [semesterId, setSemesterId] = useState(""); const [name, setName] = useState(editing?.name ?? ""); const [code, setCode] = useState(editing?.code ?? ""); const [credits, setCredits] = useState(editing?.credits ?? ""); const [instructor, setInstructor] = useState(editing?.instructor ?? ""); const [deliveryMode, setDeliveryMode] = useState<"in_person" | "online" | "hybrid" | "self_paced" | "other">(editing?.deliveryMode ?? "in_person"); const [status, setStatus] = useState<"planned" | "active" | "completed">(editing?.status === "archived" ? "completed" : editing?.status ?? "active");
  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = editing
      ? await action.execute(() => service.updateCourse(context, { id: editing.id, name: name || editing.name, ...(code ? { code } : {}), ...(credits ? { credits } : {}), ...(instructor ? { instructor } : {}), deliveryMode, status }))
      : await action.execute(() => service.createCourse(context, { semesterId, name, ...(code ? { code } : {}), ...(credits ? { credits } : {}), ...(instructor ? { instructor } : {}), deliveryMode, status }));
    if (result) { setName(""); setCode(""); setCredits(""); setInstructor(""); onDone(); }
  }
  return <Panel title={editing ? "Edit course" : "Create course"} description={editing ? `Updating ${editing.name}.` : "Courses require an existing semester."}><form className="form-grid" onSubmit={submit} noValidate>
    {!editing && <div className="field-full"><SelectInput name="courseSemester" label="Semester *" required value={semesterId} onChange={(event) => setSemesterId(event.target.value)} error={action.error?.fieldErrors.semesterId}><option value="">Select semester</option>{semesters.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput></div>}
    <TextInput name="courseCode" label="Course code" value={code} onChange={(event) => setCode(event.target.value)} error={action.error?.fieldErrors.code} />
    <TextInput name="courseName" label="Course name *" required value={name} onChange={(event) => setName(event.target.value)} error={action.error?.fieldErrors.name} />
    <TextInput name="courseCredits" label="Credits" inputMode="decimal" value={credits} onChange={(event) => setCredits(event.target.value)} error={action.error?.fieldErrors.credits} hint="A decimal string, such as 3 or 3.5." />
    <TextInput name="courseInstructor" label="Instructor" value={instructor} onChange={(event) => setInstructor(event.target.value)} error={action.error?.fieldErrors.instructor} />
    <SelectInput name="courseDelivery" label="Delivery mode *" value={deliveryMode} onChange={(event) => setDeliveryMode(event.target.value as typeof deliveryMode)}><option value="in_person">In person</option><option value="online">Online</option><option value="hybrid">Hybrid</option><option value="self_paced">Self-paced</option><option value="other">Other</option></SelectInput>
    <SelectInput name="courseStatus" label="Status *" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}><option value="planned">Planned</option><option value="active">Active</option><option value="completed">Completed</option></SelectInput>
    <ErrorBanner error={action.error} /><div className="form-actions"><SubmitButton pending={action.pending}>{editing ? "Save changes" : "Create course"}</SubmitButton>{editing && <button className="button button-secondary" type="button" onClick={onDone}>Cancel</button>}</div>
  </form></Panel>;
}
