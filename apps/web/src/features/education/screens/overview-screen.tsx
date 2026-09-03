"use client";

import Link from "next/link";
import { useCallback } from "react";
import type { Assignment, Exam, StudySession } from "@aperture/education";
import { useEducation } from "../providers/education-provider";
import { useEducationQuery } from "../hooks/use-education-query";
import { EmptyState, ErrorBanner, LoadingState, PageHeader, Panel, StatusBadge, formatDateTime } from "../components/ui";

interface OverviewData {
  readonly setupCount: number;
  readonly activeSemesterName: string | undefined;
  readonly activeCourseCount: number;
  readonly assignments: readonly Assignment[];
  readonly exams: readonly Exam[];
  readonly sessions: readonly StudySession[];
  readonly currentGpa: string | undefined;
  readonly cumulativeGpa: string | undefined;
  readonly attendance: string | undefined;
  readonly studyMinutes: number;
}

export function OverviewScreen() {
  const { service, context, clock } = useEducation();
  const load = useCallback(async (): Promise<OverviewData> => {
    const now = clock.now();
    const year = now.slice(0, 4);
    const [overview, institutions, semesterSummary, assignments, exams, sessions, study] = await Promise.all([
      service.getEducationOverview(context),
      service.listInstitutions(context),
      service.getCurrentSemesterSummary(context),
      service.listAssignments(context),
      service.listExams(context),
      service.listStudySessions(context),
      service.getStudyTimeSummary(context, { range: { startsOn: `${year}-01-01`, endsOn: `${year}-12-31` } }),
    ]);
    const performance = await service.getAcademicPerformanceSummary(context, semesterSummary ? { semesterId: semesterSummary.semester.id, gradePointScale: "4" } : { gradePointScale: "4" });
    const attendanceResults = await Promise.all((semesterSummary?.courses ?? []).map((course) => service.getCourseAttendanceSummary(context, course.id, "exclude")));
    const attended = attendanceResults.reduce((sum, item) => sum + item.calculation.attendedSessions, 0);
    const eligible = attendanceResults.reduce((sum, item) => sum + item.calculation.eligibleSessions, 0);
    return {
      setupCount: institutions.items.length,
      activeSemesterName: semesterSummary?.semester.name,
      activeCourseCount: overview.activeCourseCount,
      assignments: assignments.items,
      exams: exams.items,
      sessions: sessions.items,
      currentGpa: performance.semesterGpa?.roundedGpa,
      cumulativeGpa: performance.cumulativeGpa?.roundedCgpa,
      attendance: eligible > 0 ? `${attended}/${eligible}` : undefined,
      studyMinutes: study.totalMinutes,
    };
  }, [service, context, clock]);
  const { data, loading, error } = useEducationQuery(load);
  const now = clock.now();
  const upcomingAssignments = data?.assignments.filter((item) => item.dueAt && item.dueAt >= now && item.status !== "completed" && item.status !== "cancelled") ?? [];
  const overdueAssignments = data?.assignments.filter((item) => item.dueAt && item.dueAt < now && item.status !== "completed" && item.status !== "cancelled") ?? [];
  const upcomingExams = data?.exams.filter((item) => item.scheduledStartsAt >= now && item.status === "scheduled") ?? [];
  const recent = [
    ...(data?.assignments.filter((item) => item.status === "completed").map((item) => ({ id: item.id, label: item.title, kind: "Assignment", at: item.updatedAt })) ?? []),
    ...(data?.exams.filter((item) => item.status === "completed").map((item) => ({ id: item.id, label: item.title, kind: "Exam", at: item.updatedAt })) ?? []),
    ...(data?.sessions.filter((item) => item.status === "completed").map((item) => ({ id: item.id, label: item.title, kind: "Study", at: item.updatedAt })) ?? []),
  ].sort((a, b) => b.at.localeCompare(a.at) || a.id.localeCompare(b.id)).slice(0, 5);

  return <><PageHeader eyebrow="Education overview" title="A calm view of what matters next" description="Live summaries composed by the Education application service from this tab's in-memory repository." action={<Link className="button button-primary" href="/education/setup">Set up education</Link>} />
    <ErrorBanner error={error} />
    {loading || !data ? <LoadingState /> : data.setupCount === 0 ? <EmptyState title="Your Education space is empty" description="Create an institution, program, and semester first. Then courses and academic activity can be added without hidden sample records." href="/education/setup" action="Start setup" /> : <>
      <div className="grid metric-grid">
        <Metric label="Active semester" value={data.activeSemesterName ?? "None"} detail="Resolved by the service" />
        <Metric label="Active courses" value={String(data.activeCourseCount)} detail="Current active semester" />
        <Metric label="Upcoming assignments" value={String(upcomingAssignments.length)} detail={`${overdueAssignments.length} overdue`} />
        <Metric label="Upcoming exams" value={String(upcomingExams.length)} detail="Scheduled ahead" />
        <Metric label="Current GPA" value={data.currentGpa ?? "—"} detail="No inferred grades" />
        <Metric label="CGPA" value={data.cumulativeGpa ?? "—"} detail="4-point scale input" />
        <Metric label="Attendance" value={data.attendance ?? "—"} detail="Attended / eligible" />
        <Metric label="Study time" value={`${data.studyMinutes} min`} detail="Completed sessions this year" />
      </div>
      <div className="grid grid-2">
        <Panel title="Deadlines" description="Open assignments and scheduled exams.">{upcomingAssignments.length + upcomingExams.length === 0 ? <EmptyState title="Nothing upcoming" description="New assignment and exam deadlines will appear here." /> : <ul className="record-list">{upcomingAssignments.slice(0, 4).map((item) => <li className="record-card" key={item.id}><div><h3>{item.title}</h3><p>{formatDateTime(item.dueAt)}</p></div><StatusBadge value={item.status} /></li>)}{upcomingExams.slice(0, 4).map((item) => <li className="record-card" key={item.id}><div><h3>{item.title}</h3><p>{formatDateTime(item.scheduledStartsAt)}</p></div><StatusBadge value={item.status} /></li>)}</ul>}</Panel>
        <Panel title="Recently completed" description="Academic activity ordered by its stored update time.">{recent.length === 0 ? <EmptyState title="No completed activity" description="Complete an assignment, exam, or study session to see it here." /> : <ul className="record-list">{recent.map((item) => <li className="record-card" key={`${item.kind}-${item.id}`}><div><h3>{item.label}</h3><p>{item.kind} · {formatDateTime(item.at)}</p></div></li>)}</ul>}</Panel>
      </div>
    </>}
  </>;
}

function Metric({ label, value, detail }: { readonly label: string; readonly value: string; readonly detail: string }) {
  return <article className="metric"><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-detail">{detail}</span></article>;
}
