import { Decimal } from "decimal.js";
import { z } from "@aperture/validation";

import { calculateCgpa, calculateGpa, calculateWeightedGrade, positiveCalculationDecimalSchema } from "../../calculations.js";
import { courseIdSchema } from "../../courses/course.types.js";
import { dateRangeSchema, isoDateTimeSchema } from "../../education.types.js";
import { semesterIdSchema } from "../../semesters/semester.types.js";
import { programIdSchema } from "../../programs/program.types.js";
import type { Course } from "../../courses/course.types.js";
import type { Grade } from "../../grades/grade.types.js";
import type { Semester } from "../../semesters/semester.types.js";
import type { EducationService, AcademicPerformanceSummary, CourseGradeSummary } from "../education-service.types.js";
import type { EducationServiceDependencies } from "../../application/dependencies.js";
import {
  conflict,
  loadOwned,
  ownerQuery,
  parseApplicationInput,
  sortedPage,
  stableTextCompare,
  validateContext,
} from "../../application/application.helpers.js";

type SummaryMethods = Pick<EducationService,
  "getEducationOverview" | "getUpcomingDeadlines" | "getCurrentSemesterSummary" | "getCourseProgress" | "getStudyTimeSummary" | "getAcademicPerformanceSummary"
>;

const upcomingDeadlinesQuerySchema = z.strictObject({
  startsAt: isoDateTimeSchema,
  endsAt: isoDateTimeSchema,
  limit: z.number().int().min(1).max(100).optional(),
}).refine(({ startsAt, endsAt }) => endsAt >= startsAt, { message: "Deadline end must not precede start.", path: ["endsAt"] });

const currentSemesterSummaryQuerySchema = z.strictObject({ programId: programIdSchema.optional() });
const studyTimeSummaryQuerySchema = z.strictObject({ range: dateRangeSchema, courseId: courseIdSchema.optional() });
const academicPerformanceSummaryQuerySchema = z.strictObject({ semesterId: semesterIdSchema.optional(), gradePointScale: positiveCalculationDecimalSchema });

function exactCountPercentage(completed: number, total: number): string | undefined {
  return total === 0 ? undefined : new Decimal(completed).dividedBy(total).times(100).toFixed();
}

export function createEducationSummaryUseCases(dependencies: EducationServiceDependencies): SummaryMethods {
  const repositories = dependencies.repositories;

  async function performanceForSemester(context: Parameters<EducationService["getAcademicPerformanceSummary"]>[0], semester: Semester, scale: string) {
    const { ownerId } = validateContext(context);
    const coursesPage = await repositories.courses.findMany({ ownerId, semesterId: semester.id });
    const courses = [...coursesPage.items].sort((a, b) => stableTextCompare(a.code ?? a.name, b.code ?? b.name, a.id, b.id));
    const gradesPage = await repositories.grades.findManyBySemester({ ownerId, semesterId: semester.id });
    const grades = gradesPage.items;
    const courseGrades: CourseGradeSummary[] = [];
    const gpaCourses: { courseId: string; credits: string; gradePoints: string }[] = [];
    const missingGradePointCourseIds: string[] = [];
    let semesterCredits = new Decimal(0);

    for (const course of courses) {
      const courseGradesList = grades.filter((grade) => grade.courseId === course.id);
      const weightedComponents = courseGradesList
        .filter((grade) => grade.weightPercentage !== undefined && !new Decimal(grade.maximumScore).isZero())
        .map((grade) => ({ componentId: grade.id, scoreEarned: grade.scoreEarned, maximumScore: grade.maximumScore, weightPercentage: grade.weightPercentage as string }));
      courseGrades.push(weightedComponents.length === 0
        ? { courseId: course.id }
        : { courseId: course.id, weightedGrade: calculateWeightedGrade({ components: weightedComponents, allowExtraCredit: true, allowTotalWeightAbove100: true }) });

      const gradePointRecord = [...courseGradesList]
        .filter((grade) => grade.gradePoints !== undefined)
        .sort((a, b) => stableTextCompare(b.recordedAt, a.recordedAt, a.id, b.id))[0];
      if (course.credits !== undefined && gradePointRecord?.gradePoints !== undefined) {
        gpaCourses.push({ courseId: course.id, credits: course.credits, gradePoints: gradePointRecord.gradePoints });
        semesterCredits = semesterCredits.plus(course.credits);
      } else {
        missingGradePointCourseIds.push(course.id);
      }
    }

    const gpa = gpaCourses.length === 0 ? undefined : calculateGpa({ courses: gpaCourses, gradePointScale: scale });
    return { courses, courseGrades, missingGradePointCourseIds, gpa, semesterCredits: semesterCredits.toFixed() };
  }

  return {
    async getEducationOverview(context) {
      const { ownerId } = validateContext(context);
      const activeSemesters = await repositories.semesters.findMany({ ownerId, status: "active", limit: 2 });
      if (activeSemesters.items.length > 1) conflict("semester", undefined, "Multiple active semesters prevent an unambiguous overview.");
      const semester = activeSemesters.items[0];
      const activeCourses = semester === undefined ? { items: [] as readonly Course[] } : await repositories.courses.findMany({ ownerId, semesterId: semester.id, status: "active" });
      const now = dependencies.clock.now();
      const assignments = await repositories.assignments.findMany({ ownerId, dueFrom: now });
      const exams = await repositories.exams.findMany({ ownerId, startsAfter: now });
      return {
        ...(semester === undefined ? {} : { currentProgramId: semester.programId, currentSemesterId: semester.id }),
        activeCourseCount: activeCourses.items.length,
        upcomingAssignmentCount: assignments.items.filter((item) => item.dueAt !== undefined && item.status !== "completed" && item.status !== "cancelled").length,
        upcomingExamCount: exams.items.filter((item) => item.status !== "completed" && item.status !== "cancelled").length,
      };
    },
    async getUpcomingDeadlines(context, query) {
      const parsed = parseApplicationInput(upcomingDeadlinesQuerySchema, query);
      const { ownerId } = validateContext(context);
      const [assignments, exams, schedules] = await Promise.all([
        repositories.assignments.findMany({ ownerId, dueFrom: parsed.startsAt, dueTo: parsed.endsAt }),
        repositories.exams.findMany({ ownerId, startsAfter: parsed.startsAt, startsBefore: parsed.endsAt }),
        repositories.schedules.findMany({ ownerId, startsBefore: parsed.endsAt, endsAfter: parsed.startsAt }),
      ]);
      const deadlines = [
        ...assignments.items.filter((item) => item.dueAt !== undefined && item.status !== "completed" && item.status !== "cancelled").map((item) => ({ kind: "assignment" as const, id: item.id, courseId: item.courseId, title: item.title, dueAt: item.dueAt as string })),
        ...exams.items.filter((item) => item.status !== "completed" && item.status !== "cancelled").map((item) => ({ kind: "exam" as const, id: item.id, courseId: item.courseId, title: item.title, dueAt: item.scheduledStartsAt })),
        ...schedules.items.filter((item) => (item.entryType === "assignment" || item.entryType === "exam") && item.status !== "completed" && item.status !== "cancelled").map((item) => ({ kind: "schedule" as const, id: item.id, ...(item.courseId === undefined ? {} : { courseId: item.courseId }), title: item.title, dueAt: item.startsAt })),
      ].filter((item) => item.dueAt >= parsed.startsAt && item.dueAt <= parsed.endsAt)
        .sort((a, b) => stableTextCompare(a.dueAt, b.dueAt, a.id, b.id));
      return parsed.limit === undefined ? deadlines : deadlines.slice(0, parsed.limit);
    },
    async getCurrentSemesterSummary(context, query = {}) {
      const parsed = parseApplicationInput(currentSemesterSummaryQuerySchema, query);
      const { ownerId } = validateContext(context);
      const semesters = await repositories.semesters.findMany({ ownerId, status: "active", ...(parsed.programId === undefined ? {} : { programId: parsed.programId }), limit: 2 });
      if (semesters.items.length === 0) return null;
      if (semesters.items.length > 1) conflict("semester", undefined, "Multiple active semesters match the requested scope.");
      const semester = semesters.items[0] as Semester;
      const courses = await repositories.courses.findMany({ ownerId, semesterId: semester.id });
      const sorted = sortedPage(courses, (a, b) => stableTextCompare(a.code ?? a.name, b.code ?? b.name, a.id, b.id));
      return { semester, courses: sorted.items, completedCourseCount: sorted.items.filter((course) => course.status === "completed").length };
    },
    async getCourseProgress(context, rawCourseId) {
      const courseId = parseApplicationInput(courseIdSchema, rawCourseId);
      await loadOwned(repositories.courses, courseId, context, "course");
      const { ownerId } = validateContext(context);
      const [topics, assignments] = await Promise.all([
        repositories.topics.findMany({ ownerId, courseId }),
        repositories.assignments.findMany({ ownerId, courseId }),
      ]);
      const completedTopics = topics.items.filter((topic) => topic.status === "completed").length;
      const eligibleAssignments = assignments.items.filter((assignment) => assignment.status !== "cancelled");
      const completedAssignments = eligibleAssignments.filter((assignment) => assignment.status === "completed").length;
      const topicPercentage = exactCountPercentage(completedTopics, topics.items.length);
      const assignmentPercentage = exactCountPercentage(completedAssignments, eligibleAssignments.length);
      return {
        courseId,
        topics: { completedCount: completedTopics, totalCount: topics.items.length, ...(topicPercentage === undefined ? {} : { exactPercentage: topicPercentage }) },
        assignments: { completedCount: completedAssignments, totalCount: eligibleAssignments.length, ...(assignmentPercentage === undefined ? {} : { exactPercentage: assignmentPercentage }) },
      };
    },
    async getStudyTimeSummary(context, query) {
      const parsed = parseApplicationInput(studyTimeSummaryQuerySchema, query);
      const { ownerId } = validateContext(context);
      if (parsed.courseId !== undefined) await loadOwned(repositories.courses, parsed.courseId, context, "course");
      const sessions = await repositories.studySessions.findMany({
        ownerId,
        status: "completed",
        startsAfter: `${parsed.range.startsOn}T00:00:00Z`,
        startsBefore: `${parsed.range.endsOn}T23:59:59Z`,
        ...(parsed.courseId === undefined ? {} : { courseId: parsed.courseId }),
      });
      const completed = sessions.items.filter((session) => session.status === "completed");
      const measured = completed.filter((session) => session.actualDurationMinutes !== undefined);
      return {
        range: parsed.range,
        ...(parsed.courseId === undefined ? {} : { courseId: parsed.courseId }),
        totalMinutes: measured.reduce((total, session) => total + (session.actualDurationMinutes ?? 0), 0),
        sessionCount: measured.length,
        omittedSessionCount: completed.length - measured.length,
      };
    },
    async getAcademicPerformanceSummary(context, query): Promise<AcademicPerformanceSummary> {
      const parsed = parseApplicationInput(academicPerformanceSummaryQuerySchema, query);
      const { ownerId } = validateContext(context);
      const allSemesters = await repositories.semesters.findMany({ ownerId });
      const selectedSemester = parsed.semesterId === undefined ? undefined : await loadOwned(repositories.semesters, parsed.semesterId, context, "semester");
      const selectedPerformance = selectedSemester === undefined ? undefined : await performanceForSemester(context, selectedSemester, parsed.gradePointScale);
      const cgpaSemesters: { semesterId: string; gpa: string; credits: string }[] = [];
      for (const semester of allSemesters.items) {
        const performance = selectedSemester?.id === semester.id && selectedPerformance !== undefined
          ? selectedPerformance
          : await performanceForSemester(context, semester, parsed.gradePointScale);
        if (performance.gpa !== undefined && !new Decimal(performance.semesterCredits).isZero()) {
          cgpaSemesters.push({ semesterId: semester.id, gpa: performance.gpa.exactGpa, credits: performance.semesterCredits });
        }
      }
      return {
        ...(selectedSemester === undefined ? {} : { semesterId: selectedSemester.id }),
        courseGrades: selectedPerformance?.courseGrades ?? [],
        ...(selectedPerformance?.gpa === undefined ? {} : { semesterGpa: selectedPerformance.gpa }),
        ...(cgpaSemesters.length === 0 ? {} : { cumulativeGpa: calculateCgpa({ semesters: cgpaSemesters, gradePointScale: parsed.gradePointScale }) }),
        missingGradePointCourseIds: selectedPerformance?.missingGradePointCourseIds ?? [],
      };
    },
  };
}
