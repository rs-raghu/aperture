import { useCallback } from "react";
import type { Assignment, Exam, StudySession } from "@aperture/education";
import { EmptyState, ErrorBanner, LoadingState, Metric, NavigationCard, PageHeader, Panel, PreviewNotice, RecordCard, Screen } from "../components/ui";
import { educationNavigation } from "../navigation/education-navigation";
import { useEducation } from "../providers/education-provider";
import { useEducationQuery } from "../hooks/use-education-query";
import { formatDateTime } from "../view-models/formatting";

interface OverviewData {
  readonly setupCount: number;
  readonly activeSemesterName?: string;
  readonly activeCourseCount: number;
  readonly assignments: readonly Assignment[];
  readonly exams: readonly Exam[];
  readonly sessions: readonly StudySession[];
  readonly currentGpa?: string;
  readonly cumulativeGpa?: string;
  readonly attendance?: string;
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
    const attendanceResults = await Promise.all((semesterSummary?.courses ?? []).map(async (course) => {
      const records = await service.listAttendanceByCourse(context, { courseId: course.id });
      return records.items.length === 0 ? null : service.getCourseAttendanceSummary(context, course.id, "exclude");
    }));
    const attended = attendanceResults.reduce((sum, item) => sum + (item?.calculation.attendedSessions ?? 0), 0);
    const eligible = attendanceResults.reduce((sum, item) => sum + (item?.calculation.eligibleSessions ?? 0), 0);
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
  const query = useEducationQuery(load);
  const now = clock.now();
  const upcomingAssignments = query.data?.assignments.filter((item) => item.dueAt && item.dueAt >= now && item.status !== "completed" && item.status !== "cancelled") ?? [];
  const overdueAssignments = query.data?.assignments.filter((item) => item.dueAt && item.dueAt < now && item.status !== "completed" && item.status !== "cancelled") ?? [];
  const upcomingExams = query.data?.exams.filter((item) => item.scheduledStartsAt >= now && item.status === "scheduled") ?? [];
  const recent = [
    ...(query.data?.assignments.filter((item) => item.status === "completed").map((item) => ({ id: item.id, label: item.title, kind: "Assignment", at: item.updatedAt })) ?? []),
    ...(query.data?.exams.filter((item) => item.status === "completed").map((item) => ({ id: item.id, label: item.title, kind: "Exam", at: item.updatedAt })) ?? []),
    ...(query.data?.sessions.filter((item) => item.status === "completed").map((item) => ({ id: item.id, label: item.title, kind: "Study", at: item.updatedAt })) ?? []),
  ].sort((left, right) => right.at.localeCompare(left.at) || left.id.localeCompare(right.id)).slice(0, 5);

  return (
    <Screen testID="education-overview-screen">
      <PageHeader title="Education" description="A focused mobile preview powered by the real Education application service." />
      <PreviewNotice />
      <ErrorBanner error={query.error} />
      {query.loading || !query.data ? <LoadingState /> : query.data.setupCount === 0 ? (
        <EmptyState title="Your Education space is empty" description="Create an institution, program, and semester first. No sample records are hidden in this preview." href="/education/setup" action="Start setup" />
      ) : (
        <>
          <Panel title="At a glance">
            <></>
            <Metric label="Active semester" value={query.data.activeSemesterName ?? "None"} detail="Resolved by the service" />
            <Metric label="Active courses" value={String(query.data.activeCourseCount)} detail="Current active semester" />
            <Metric label="Assignments" value={String(upcomingAssignments.length)} detail={`${overdueAssignments.length} overdue`} />
            <Metric label="Upcoming exams" value={String(upcomingExams.length)} detail="Scheduled ahead" />
            <Metric label="Current GPA" value={query.data.currentGpa ?? "—"} detail="No inferred grades" />
            <Metric label="CGPA" value={query.data.cumulativeGpa ?? "—"} detail="4-point scale input" />
            <Metric label="Attendance" value={query.data.attendance ?? "—"} detail="Attended / eligible" />
            <Metric label="Study time" value={`${query.data.studyMinutes} min`} detail="Completed sessions this year" />
          </Panel>
          <Panel title="Upcoming work">
            {upcomingAssignments.length + upcomingExams.length === 0 ? <EmptyState title="Nothing upcoming" description="Open assignments and scheduled exams will appear here." /> : (
              <>
                {upcomingAssignments.slice(0, 3).map((item) => <RecordCard key={item.id} title={item.title} status={item.status} details={[`Assignment · ${formatDateTime(item.dueAt)}`]} />)}
                {upcomingExams.slice(0, 3).map((item) => <RecordCard key={item.id} title={item.title} status={item.status} details={[`Exam · ${formatDateTime(item.scheduledStartsAt)}`]} />)}
              </>
            )}
          </Panel>
          <Panel title="Recently completed">
            {!recent.length ? <EmptyState title="No completed activity" description="Completed assignments, exams, and study sessions will appear here." /> : recent.map((item) => <RecordCard key={`${item.kind}-${item.id}`} title={item.label} details={[`${item.kind} · ${formatDateTime(item.at)}`]} />)}
          </Panel>
        </>
      )}
      <Panel title="Education tools" description="Open a focused workflow. Your provider remains mounted as you navigate.">
        {educationNavigation.map((item) => <NavigationCard key={item.href} href={item.href} title={item.label} description={item.description} />)}
      </Panel>
    </Screen>
  );
}
