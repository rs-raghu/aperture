"use client";

import { useCallback, useState, type FormEvent } from "react";
import type { Assignment, Course, Exam, Grade, Semester } from "@aperture/education";
import { useEducation } from "../providers/education-provider";
import { useEducationAction } from "../hooks/use-education-action";
import { useEducationQuery } from "../hooks/use-education-query";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, SelectInput, SubmitButton, TextInput, formatDateTime } from "../components/ui";

interface GradeData { readonly courses: readonly Course[]; readonly semesters: readonly Semester[]; readonly assignments: readonly Assignment[]; readonly exams: readonly Exam[]; }

export function GradesScreen() {
  const { service, context } = useEducation(); const [courseId, setCourseId] = useState("");
  const load = useCallback(async (): Promise<GradeData> => { const [courses, semesters, assignments, exams] = await Promise.all([service.listCourses(context), service.listSemesters(context), service.listAssignments(context), service.listExams(context)]); return { courses: courses.items, semesters: semesters.items, assignments: assignments.items, exams: exams.items }; }, [service, context]);
  const query = useEducationQuery(load);
  return <><PageHeader eyebrow="Performance" title="Grades" description="Record assessment outcomes and read weighted-grade, GPA, and CGPA results produced by the existing calculation layer." />
    <div className="filters"><SelectInput name="gradeCourseFilter" label="Course" value={courseId} onChange={(event) => setCourseId(event.target.value)}><option value="">Select a course</option>{query.data?.courses.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</SelectInput></div>
    <ErrorBanner error={query.error} />{query.loading ? <LoadingState /> : !courseId ? <EmptyState title="Choose a course" description={query.data?.courses.length ? "Select a course to record and review grades." : "Create a course before recording grades."} href="/education/courses" action="Open courses" /> : <GradeWorkspace courseId={courseId} data={query.data!} />}
  </>;
}

function GradeWorkspace({ courseId, data }: { readonly courseId: string; readonly data: GradeData }) {
  const { service, context } = useEducation(); const action = useEducationAction();
  const load = useCallback(async () => {
    const course = data.courses.find((item) => item.id === courseId);
    const grades = await service.listGradesByCourse(context, { courseId });
    const performance = await service.getAcademicPerformanceSummary(context, course ? { semesterId: course.semesterId, gradePointScale: "4" } : { gradePointScale: "4" });
    return { grades: grades.items, performance, course };
  }, [service, context, courseId, data]);
  const query = useEducationQuery(load); const weighted = query.data?.performance.courseGrades.find((item) => item.courseId === courseId)?.weightedGrade;
  return <div className="grid grid-2"><GradeForm courseId={courseId} course={query.data?.course} assignments={data.assignments.filter((item) => item.courseId === courseId)} exams={data.exams.filter((item) => item.courseId === courseId)} /><Panel title="Gradebook" description="Exact decimal inputs are preserved; calculations are not performed in React."><div className="grid metric-grid"><article className="metric"><span className="metric-label">Weighted course grade</span><strong className="metric-value">{weighted ? `${weighted.roundedCurrentGrade}%` : "—"}</strong><span className="metric-detail">{weighted?.warnings.join(", ") || "Needs weighted grade records"}</span></article><article className="metric"><span className="metric-label">Semester GPA</span><strong className="metric-value">{query.data?.performance.semesterGpa?.roundedGpa ?? "—"}</strong><span className="metric-detail">4-point configured scale</span></article><article className="metric"><span className="metric-label">CGPA</span><strong className="metric-value">{query.data?.performance.cumulativeGpa?.roundedCgpa ?? "—"}</strong><span className="metric-detail">Available graded semesters</span></article></div><ErrorBanner error={query.error ?? action.error} />{query.loading ? <LoadingState /> : !query.data?.grades.length ? <EmptyState title="No grades recorded" description="Use the form to add a manual, assignment, or exam grade." /> : <GradeList grades={query.data.grades} onDelete={(grade) => { if (window.confirm(`Delete grade ${grade.title}?`)) void action.execute(() => service.deleteGrade(context, grade.id)); }} pending={action.pending} />}</Panel></div>;
}

function GradeForm({ courseId, course, assignments, exams }: { readonly courseId: string; readonly course?: Course | undefined; readonly assignments: readonly Assignment[]; readonly exams: readonly Exam[] }) {
  const { service, context, clock } = useEducation(); const action = useEducationAction();
  const [sourceType, setSourceType] = useState<"manual" | "assignment" | "exam">("manual"); const [sourceId, setSourceId] = useState(""); const [title, setTitle] = useState(""); const [score, setScore] = useState(""); const [maximum, setMaximum] = useState(""); const [points, setPoints] = useState(""); const [weight, setWeight] = useState("");
  async function submit(event: FormEvent) { event.preventDefault(); const result = await action.execute(() => service.recordGrade(context, { courseId, ...(course ? { semesterId: course.semesterId } : {}), sourceType, ...(sourceType === "assignment" ? { assignmentId: sourceId } : {}), ...(sourceType === "exam" ? { examId: sourceId } : {}), title, scoreEarned: score, maximumScore: maximum, ...(points ? { gradePoints: points } : {}), ...(weight ? { weightPercentage: weight } : {}), recordedAt: clock.now() })); if (result) { setTitle(""); setScore(""); setMaximum(""); setPoints(""); setWeight(""); setSourceId(""); } }
  const sources = sourceType === "assignment" ? assignments : exams;
  return <Panel title="Record grade" description="Grade points are optional; GPA appears only when explicit points and course credits exist."><form className="form-grid" onSubmit={submit} noValidate><SelectInput name="gradeSource" label="Source type *" value={sourceType} onChange={(event) => { setSourceType(event.target.value as typeof sourceType); setSourceId(""); }}><option value="manual">Manual</option><option value="assignment">Assignment</option><option value="exam">Exam</option></SelectInput>{sourceType !== "manual" ? <SelectInput name="gradeAssessment" label={`${sourceType} *`} required value={sourceId} onChange={(event) => setSourceId(event.target.value)} error={action.error?.fieldErrors[sourceType === "assignment" ? "assignmentId" : "examId"]}><option value="">Select {sourceType}</option>{sources.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</SelectInput> : <span />}<div className="field-full"><TextInput name="gradeTitle" label="Grade title *" required value={title} onChange={(event) => setTitle(event.target.value)} error={action.error?.fieldErrors.title} /></div><TextInput name="gradeScore" label="Score earned *" inputMode="decimal" required value={score} onChange={(event) => setScore(event.target.value)} error={action.error?.fieldErrors.scoreEarned} /><TextInput name="gradeMaximum" label="Maximum score *" inputMode="decimal" required value={maximum} onChange={(event) => setMaximum(event.target.value)} error={action.error?.fieldErrors.maximumScore} /><TextInput name="gradePoints" label="Grade points" inputMode="decimal" value={points} onChange={(event) => setPoints(event.target.value)} error={action.error?.fieldErrors.gradePoints} hint="For example 3.75 on a 4-point scale." /><TextInput name="gradeWeight" label="Weight (%)" inputMode="decimal" value={weight} onChange={(event) => setWeight(event.target.value)} error={action.error?.fieldErrors.weightPercentage} /><ErrorBanner error={action.error} /><div className="form-actions"><SubmitButton pending={action.pending}>Record grade</SubmitButton></div></form></Panel>;
}

function GradeList({ grades, onDelete, pending }: { readonly grades: readonly Grade[]; readonly onDelete: (grade: Grade) => void; readonly pending: boolean }) {
  return <div className="table-wrap"><table><thead><tr><th>Grade</th><th>Score</th><th>Points</th><th>Weight</th><th>Recorded</th><th>Action</th></tr></thead><tbody>{grades.map((grade) => <tr key={grade.id}><td>{grade.title}</td><td>{grade.scoreEarned} / {grade.maximumScore}</td><td>{grade.gradePoints ?? "—"}</td><td>{grade.weightPercentage ? `${grade.weightPercentage}%` : "—"}</td><td>{formatDateTime(grade.recordedAt)}</td><td><button className="button button-small button-danger" disabled={pending} onClick={() => onDelete(grade)}>Delete</button></td></tr>)}</tbody></table></div>;
}
