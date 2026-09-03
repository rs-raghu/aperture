import { calculateAttendancePercentage } from "../../calculations.js";
import {
  assignmentIdSchema,
  assignmentQuerySchema,
  assignmentSchema,
  createAssignmentInputSchema,
  upcomingAssignmentsQuerySchema,
  updateAssignmentInputSchema,
} from "../../assignments/assignment.types.js";
import {
  createExamInputSchema,
  examIdSchema,
  examQuerySchema,
  examSchema,
  upcomingExamsQuerySchema,
  updateExamInputSchema,
} from "../../exams/exam.types.js";
import {
  gradeIdSchema,
  gradeSchema,
  gradesByCourseQuerySchema,
  gradesBySemesterQuerySchema,
  recordGradeInputSchema,
  updateGradeInputSchema,
} from "../../grades/grade.types.js";
import {
  attendanceByCourseQuerySchema,
  attendanceRecordIdSchema,
  attendanceRecordSchema,
  recordAttendanceInputSchema,
  updateAttendanceInputSchema,
} from "../../attendance/attendance.types.js";
import { courseIdSchema } from "../../courses/course.types.js";
import type { EducationService } from "../../services/education-service.types.js";
import type { EducationServiceDependencies } from "../dependencies.js";
import {
  conflict,
  findOwned,
  invalidTransition,
  loadOwned,
  materializeEntity,
  ownerQuery,
  parseApplicationInput,
  parseCreateInput,
  requireParent,
  sortedPage,
  stableTextCompare,
  updateEntity,
  validateContext,
} from "../application.helpers.js";

type AssessmentMethods = Pick<EducationService,
  | "createAssignment" | "updateAssignment" | "submitAssignment" | "markAssignmentComplete" | "getAssignment" | "listAssignments" | "getUpcomingAssignments"
  | "createExam" | "updateExam" | "completeExam" | "getExam" | "listExams" | "getUpcomingExams"
  | "recordGrade" | "updateGrade" | "deleteGrade" | "getGrade" | "listGradesByCourse" | "listGradesBySemester"
  | "recordAttendance" | "updateAttendance" | "deleteAttendance" | "listAttendanceByCourse" | "getCourseAttendanceSummary"
>;

const assignmentTransitions: Readonly<Record<string, readonly string[]>> = {
  draft: ["assigned", "cancelled"],
  assigned: ["cancelled"],
  submitted: [],
  completed: [],
  cancelled: [],
};

function slicePage<TEntity>(page: { readonly items: readonly TEntity[]; readonly nextCursor?: string }, limit?: number) {
  const items = limit === undefined ? page.items : page.items.slice(0, limit);
  return page.nextCursor === undefined ? { items } : { items, nextCursor: page.nextCursor };
}

export function createAssessmentUseCases(dependencies: EducationServiceDependencies): AssessmentMethods {
  const repositories = dependencies.repositories;

  async function validateCourseTopic(context: Parameters<EducationService["createAssignment"]>[0], courseId: string, topicId?: string) {
    const course = await requireParent(repositories.courses, courseId, context, "course");
    if (topicId !== undefined) {
      const topic = await requireParent(repositories.topics, topicId, context, "topic");
      if (topic.courseId !== course.id) conflict("topic", topic.id, "The topic must belong to the selected course.");
    }
    return course;
  }

  return {
    async createAssignment(context, input) {
      const parsed = parseCreateInput(context, input, createAssignmentInputSchema);
      if (parsed.status !== "draft" && parsed.status !== "assigned") invalidTransition("assignment", "new", "new", parsed.status);
      await validateCourseTopic(context, parsed.courseId, parsed.topicId);
      return repositories.assignments.create(materializeEntity(dependencies, parsed, assignmentSchema));
    },
    async updateAssignment(context, input) {
      const id = parseApplicationInput(assignmentIdSchema, input.id);
      const existing = await loadOwned(repositories.assignments, id, context, "assignment");
      if (existing.status === "completed" || existing.status === "cancelled") invalidTransition("assignment", id, existing.status, "updated");
      if (input.submittedAt !== undefined) invalidTransition("assignment", id, existing.status, "submitted-through-update");
      if (input.status !== undefined && input.status !== existing.status && !assignmentTransitions[existing.status]?.includes(input.status)) {
        invalidTransition("assignment", id, existing.status, input.status);
      }
      const courseId = input.courseId ?? existing.courseId;
      await validateCourseTopic(context, courseId, input.topicId ?? existing.topicId);
      return repositories.assignments.update(updateEntity(dependencies, existing, input, updateAssignmentInputSchema, assignmentSchema));
    },
    async submitAssignment(context, rawId) {
      const id = parseApplicationInput(assignmentIdSchema, rawId);
      const existing = await loadOwned(repositories.assignments, id, context, "assignment");
      if (existing.status === "submitted") return existing;
      if (existing.status !== "assigned") invalidTransition("assignment", id, existing.status, "submitted");
      return repositories.assignments.update(updateEntity(dependencies, existing, { id, status: "submitted", submittedAt: dependencies.clock.now() }, updateAssignmentInputSchema, assignmentSchema));
    },
    async markAssignmentComplete(context, rawId) {
      const id = parseApplicationInput(assignmentIdSchema, rawId);
      const existing = await loadOwned(repositories.assignments, id, context, "assignment");
      if (existing.status === "completed") return existing;
      if (existing.status !== "submitted") invalidTransition("assignment", id, existing.status, "completed");
      return repositories.assignments.update(updateEntity(dependencies, existing, { id, status: "completed" }, updateAssignmentInputSchema, assignmentSchema));
    },
    async getAssignment(context, rawId) {
      const id = parseApplicationInput(assignmentIdSchema, rawId);
      return findOwned(repositories.assignments, id, context, "assignment");
    },
    async listAssignments(context, query = {}) {
      const parsed = parseApplicationInput(assignmentQuerySchema, ownerQuery(context, query));
      return sortedPage(await repositories.assignments.findMany(parsed), (a, b) => stableTextCompare(a.dueAt, b.dueAt, a.id, b.id), parsed.sortDirection);
    },
    async getUpcomingAssignments(context, query = {}) {
      const parsed = parseApplicationInput(upcomingAssignmentsQuerySchema, ownerQuery(context, query));
      const page = await repositories.assignments.findMany({ ownerId: parsed.ownerId, courseId: parsed.courseId, dueFrom: dependencies.clock.now(), dueTo: parsed.dueBefore, limit: parsed.limit });
      const sorted = sortedPage({ items: page.items.filter((item) => item.dueAt !== undefined && item.status !== "completed" && item.status !== "cancelled") }, (a, b) => stableTextCompare(a.dueAt, b.dueAt, a.id, b.id));
      return slicePage(sorted, parsed.limit);
    },

    async createExam(context, input) {
      const parsed = parseCreateInput(context, input, createExamInputSchema);
      if (parsed.status !== "scheduled") invalidTransition("exam", "new", "new", parsed.status);
      const course = await requireParent(repositories.courses, parsed.courseId, context, "course");
      if (parsed.semesterId !== undefined) {
        await requireParent(repositories.semesters, parsed.semesterId, context, "semester");
        if (course.semesterId !== parsed.semesterId) conflict("exam", undefined, "The exam semester must match its course semester.");
      }
      return repositories.exams.create(materializeEntity(dependencies, parsed, examSchema));
    },
    async updateExam(context, input) {
      const id = parseApplicationInput(examIdSchema, input.id);
      const existing = await loadOwned(repositories.exams, id, context, "exam");
      if (existing.status !== "scheduled") invalidTransition("exam", id, existing.status, "updated");
      if (input.status !== undefined && input.status !== "scheduled" && input.status !== "cancelled") invalidTransition("exam", id, existing.status, input.status);
      const courseId = input.courseId ?? existing.courseId;
      const course = await requireParent(repositories.courses, courseId, context, "course");
      const semesterId = input.semesterId ?? existing.semesterId;
      if (semesterId !== undefined) {
        await requireParent(repositories.semesters, semesterId, context, "semester");
        if (course.semesterId !== semesterId) conflict("exam", id, "The exam semester must match its course semester.");
      }
      return repositories.exams.update(updateEntity(dependencies, existing, input, updateExamInputSchema, examSchema));
    },
    async completeExam(context, rawId) {
      const id = parseApplicationInput(examIdSchema, rawId);
      const existing = await loadOwned(repositories.exams, id, context, "exam");
      if (existing.status === "completed") return existing;
      if (existing.status !== "scheduled") invalidTransition("exam", id, existing.status, "completed");
      return repositories.exams.update(updateEntity(dependencies, existing, { id, status: "completed" }, updateExamInputSchema, examSchema));
    },
    async getExam(context, rawId) {
      const id = parseApplicationInput(examIdSchema, rawId);
      return findOwned(repositories.exams, id, context, "exam");
    },
    async listExams(context, query = {}) {
      const parsed = parseApplicationInput(examQuerySchema, ownerQuery(context, query));
      return sortedPage(await repositories.exams.findMany(parsed), (a, b) => stableTextCompare(a.scheduledStartsAt, b.scheduledStartsAt, a.id, b.id), parsed.sortDirection);
    },
    async getUpcomingExams(context, query = {}) {
      const parsed = parseApplicationInput(upcomingExamsQuerySchema, ownerQuery(context, query));
      const page = await repositories.exams.findMany({ ownerId: parsed.ownerId, courseId: parsed.courseId, startsAfter: dependencies.clock.now(), startsBefore: parsed.startsBefore, limit: parsed.limit });
      const sorted = sortedPage({ items: page.items.filter((item) => item.status !== "completed" && item.status !== "cancelled") }, (a, b) => stableTextCompare(a.scheduledStartsAt, b.scheduledStartsAt, a.id, b.id));
      return slicePage(sorted, parsed.limit);
    },

    async recordGrade(context, input) {
      const parsed = parseCreateInput(context, input, recordGradeInputSchema);
      const course = await requireParent(repositories.courses, parsed.courseId, context, "course");
      if (parsed.semesterId !== undefined && parsed.semesterId !== course.semesterId) conflict("grade", undefined, "The grade semester must match its course semester.");
      if (parsed.assignmentId !== undefined) {
        const assignment = await requireParent(repositories.assignments, parsed.assignmentId, context, "assignment");
        if (assignment.courseId !== course.id) conflict("grade", undefined, "The assignment must belong to the grade course.");
      }
      if (parsed.examId !== undefined) {
        const exam = await requireParent(repositories.exams, parsed.examId, context, "exam");
        if (exam.courseId !== course.id) conflict("grade", undefined, "The exam must belong to the grade course.");
      }
      if (parsed.assignmentId !== undefined || parsed.examId !== undefined) {
        const duplicate = await repositories.grades.findForGradeable(parsed.ownerId, parsed.courseId, parsed.assignmentId, parsed.examId);
        if (duplicate !== null) conflict("grade", duplicate.id, "A grade already exists for this assessment.");
      }
      return repositories.grades.create(materializeEntity(dependencies, parsed, gradeSchema));
    },
    async updateGrade(context, input) {
      const id = parseApplicationInput(gradeIdSchema, input.id);
      const existing = await loadOwned(repositories.grades, id, context, "grade");
      const courseId = input.courseId ?? existing.courseId;
      const course = await requireParent(repositories.courses, courseId, context, "course");
      const assignmentId = input.assignmentId ?? existing.assignmentId;
      const examId = input.examId ?? existing.examId;
      if (assignmentId !== undefined) {
        const assignment = await requireParent(repositories.assignments, assignmentId, context, "assignment");
        if (assignment.courseId !== course.id) conflict("grade", id, "The assignment must belong to the grade course.");
      }
      if (examId !== undefined) {
        const exam = await requireParent(repositories.exams, examId, context, "exam");
        if (exam.courseId !== course.id) conflict("grade", id, "The exam must belong to the grade course.");
      }
      if (assignmentId !== undefined || examId !== undefined) {
        const duplicate = await repositories.grades.findForGradeable(existing.ownerId, courseId, assignmentId, examId);
        if (duplicate !== null && duplicate.id !== id) conflict("grade", duplicate.id, "A grade already exists for this assessment.");
      }
      return repositories.grades.update(updateEntity(dependencies, existing, input, updateGradeInputSchema, gradeSchema));
    },
    async deleteGrade(context, rawId) {
      const id = parseApplicationInput(gradeIdSchema, rawId);
      await loadOwned(repositories.grades, id, context, "grade");
      return repositories.grades.delete(id, validateContext(context).ownerId);
    },
    async getGrade(context, rawId) {
      const id = parseApplicationInput(gradeIdSchema, rawId);
      return findOwned(repositories.grades, id, context, "grade");
    },
    async listGradesByCourse(context, query) {
      const parsed = parseApplicationInput(gradesByCourseQuerySchema, ownerQuery(context, query));
      await requireParent(repositories.courses, parsed.courseId, context, "course");
      return sortedPage(await repositories.grades.findMany(parsed), (a, b) => stableTextCompare(a.recordedAt, b.recordedAt, a.id, b.id), parsed.sortDirection);
    },
    async listGradesBySemester(context, query) {
      const parsed = parseApplicationInput(gradesBySemesterQuerySchema, ownerQuery(context, query));
      await requireParent(repositories.semesters, parsed.semesterId, context, "semester");
      return sortedPage(await repositories.grades.findManyBySemester(parsed), (a, b) => stableTextCompare(a.recordedAt, b.recordedAt, a.id, b.id), parsed.sortDirection);
    },

    async recordAttendance(context, input) {
      const parsed = parseCreateInput(context, input, recordAttendanceInputSchema);
      await requireParent(repositories.courses, parsed.courseId, context, "course");
      const duplicate = await repositories.attendance.findByCourseAndSessionDate(parsed.ownerId, parsed.courseId, parsed.sessionDate);
      if (duplicate !== null) conflict("attendance", duplicate.id, "Attendance already exists for this course and session date.");
      return repositories.attendance.create(materializeEntity(dependencies, parsed, attendanceRecordSchema));
    },
    async updateAttendance(context, input) {
      const id = parseApplicationInput(attendanceRecordIdSchema, input.id);
      const existing = await loadOwned(repositories.attendance, id, context, "attendance");
      const courseId = input.courseId ?? existing.courseId;
      const sessionDate = input.sessionDate ?? existing.sessionDate;
      await requireParent(repositories.courses, courseId, context, "course");
      if (courseId !== existing.courseId || sessionDate !== existing.sessionDate) {
        const duplicate = await repositories.attendance.findByCourseAndSessionDate(existing.ownerId, courseId, sessionDate);
        if (duplicate !== null && duplicate.id !== id) conflict("attendance", duplicate.id, "Attendance already exists for this course and session date.");
      }
      return repositories.attendance.update(updateEntity(dependencies, existing, input, updateAttendanceInputSchema, attendanceRecordSchema));
    },
    async deleteAttendance(context, rawId) {
      const id = parseApplicationInput(attendanceRecordIdSchema, rawId);
      await loadOwned(repositories.attendance, id, context, "attendance");
      return repositories.attendance.delete(id, validateContext(context).ownerId);
    },
    async listAttendanceByCourse(context, query) {
      const parsed = parseApplicationInput(attendanceByCourseQuerySchema, ownerQuery(context, query));
      await requireParent(repositories.courses, parsed.courseId, context, "course");
      return sortedPage(await repositories.attendance.findMany(parsed), (a, b) => stableTextCompare(a.sessionDate, b.sessionDate, a.id, b.id), parsed.sortDirection);
    },
    async getCourseAttendanceSummary(context, rawCourseId, excusedPolicy) {
      const courseId = parseApplicationInput(courseIdSchema, rawCourseId);
      await requireParent(repositories.courses, courseId, context, "course");
      const { ownerId } = validateContext(context);
      const records = await repositories.attendance.findMany({ ownerId, courseId });
      const calculation = calculateAttendancePercentage({
        records: records.items.map((record) => ({ attendanceRecordId: record.id, status: record.status })),
        excusedPolicy,
      });
      return { courseId, calculation };
    },
  };
}
