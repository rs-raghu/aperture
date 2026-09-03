import {
  createStudySessionInputSchema,
  studySessionIdSchema,
  studySessionQuerySchema,
  studySessionSchema,
  studySessionsByCourseQuerySchema,
  updateStudySessionInputSchema,
} from "../../study-sessions/study-session.types.js";
import {
  createScheduleEntryInputSchema,
  scheduleEntryIdSchema,
  scheduleEntryQuerySchema,
  scheduleEntrySchema,
  updateScheduleEntryInputSchema,
} from "../../schedules/schedule.types.js";
import {
  createResourceInputSchema,
  learningResourceSchema,
  resourceIdSchema,
  resourcesByCourseQuerySchema,
  updateResourceInputSchema,
} from "../../resources/resource.types.js";
import {
  certificateIdSchema,
  certificateQuerySchema,
  certificateSchema,
  createCertificateInputSchema,
  updateCertificateInputSchema,
} from "../../certificates/certificate.types.js";
import {
  createEducationGoalInputSchema,
  educationGoalIdSchema,
  educationGoalQuerySchema,
  educationGoalSchema,
  updateEducationGoalInputSchema,
} from "../../goals/education-goal.types.js";
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

type PlanningMethods = Pick<EducationService,
  | "scheduleStudySession" | "startStudySession" | "completeStudySession" | "cancelStudySession" | "getStudySession" | "listStudySessions" | "listStudySessionsByCourse"
  | "createScheduleEntry" | "updateScheduleEntry" | "deleteScheduleEntry" | "getScheduleEntry" | "listScheduleEntries"
  | "createResource" | "updateResource" | "archiveResource" | "getResource" | "listResourcesByCourse"
  | "createCertificate" | "updateCertificate" | "deleteCertificate" | "getCertificate" | "listCertificates"
  | "createEducationGoal" | "updateEducationGoal" | "completeEducationGoal" | "archiveEducationGoal" | "getEducationGoal" | "listEducationGoals"
>;

export function createPlanningUseCases(dependencies: EducationServiceDependencies): PlanningMethods {
  const repositories = dependencies.repositories;

  async function validateCourseTopic(context: Parameters<EducationService["scheduleStudySession"]>[0], courseId: string, topicId?: string): Promise<void> {
    await requireParent(repositories.courses, courseId, context, "course");
    if (topicId !== undefined) {
      const topic = await requireParent(repositories.topics, topicId, context, "topic");
      if (topic.courseId !== courseId) conflict("topic", topic.id, "The topic must belong to the selected course.");
    }
  }

  async function validateGoalScope(context: Parameters<EducationService["createEducationGoal"]>[0], scope: { readonly programId?: string | undefined; readonly semesterId?: string | undefined; readonly courseId?: string | undefined }): Promise<void> {
    if (scope.programId !== undefined) await requireParent(repositories.programs, scope.programId, context, "program");
    if (scope.semesterId !== undefined) await requireParent(repositories.semesters, scope.semesterId, context, "semester");
    if (scope.courseId !== undefined) await requireParent(repositories.courses, scope.courseId, context, "course");
  }

  return {
    async scheduleStudySession(context, input) {
      const parsed = parseCreateInput(context, input, createStudySessionInputSchema);
      if (parsed.status !== "scheduled") invalidTransition("study session", "new", "new", parsed.status);
      await validateCourseTopic(context, parsed.courseId, parsed.topicId);
      return repositories.studySessions.create(materializeEntity(dependencies, parsed, studySessionSchema));
    },
    async startStudySession(context, rawId) {
      const id = parseApplicationInput(studySessionIdSchema, rawId);
      const existing = await loadOwned(repositories.studySessions, id, context, "study session");
      if (existing.status !== "scheduled") invalidTransition("study session", id, existing.status, "in_progress");
      return repositories.studySessions.update(updateEntity(dependencies, existing, { id, status: "in_progress", actualStartsAt: dependencies.clock.now() }, updateStudySessionInputSchema, studySessionSchema));
    },
    async completeStudySession(context, rawId) {
      const id = parseApplicationInput(studySessionIdSchema, rawId);
      const existing = await loadOwned(repositories.studySessions, id, context, "study session");
      if (existing.status === "completed") return existing;
      if (existing.status !== "in_progress" && existing.status !== "paused") invalidTransition("study session", id, existing.status, "completed");
      return repositories.studySessions.update(updateEntity(dependencies, existing, { id, status: "completed", actualEndsAt: dependencies.clock.now() }, updateStudySessionInputSchema, studySessionSchema));
    },
    async cancelStudySession(context, rawId) {
      const id = parseApplicationInput(studySessionIdSchema, rawId);
      const existing = await loadOwned(repositories.studySessions, id, context, "study session");
      if (existing.status === "cancelled") return existing;
      if (existing.status === "completed") invalidTransition("study session", id, "completed", "cancelled");
      return repositories.studySessions.update(updateEntity(dependencies, existing, { id, status: "cancelled" }, updateStudySessionInputSchema, studySessionSchema));
    },
    async getStudySession(context, rawId) {
      const id = parseApplicationInput(studySessionIdSchema, rawId);
      return findOwned(repositories.studySessions, id, context, "study session");
    },
    async listStudySessions(context, query = {}) {
      const parsed = parseApplicationInput(studySessionQuerySchema, ownerQuery(context, query));
      return sortedPage(await repositories.studySessions.findMany(parsed), (a, b) => stableTextCompare(a.plannedStartsAt, b.plannedStartsAt, a.id, b.id), parsed.sortDirection);
    },
    async listStudySessionsByCourse(context, query) {
      const parsed = parseApplicationInput(studySessionsByCourseQuerySchema, ownerQuery(context, query));
      await requireParent(repositories.courses, parsed.courseId, context, "course");
      return sortedPage(await repositories.studySessions.findMany(parsed), (a, b) => stableTextCompare(a.plannedStartsAt, b.plannedStartsAt, a.id, b.id), parsed.sortDirection);
    },

    async createScheduleEntry(context, input) {
      const parsed = parseCreateInput(context, input, createScheduleEntryInputSchema);
      if (parsed.courseId !== undefined) await requireParent(repositories.courses, parsed.courseId, context, "course");
      return repositories.schedules.create(materializeEntity(dependencies, parsed, scheduleEntrySchema));
    },
    async updateScheduleEntry(context, input) {
      const id = parseApplicationInput(scheduleEntryIdSchema, input.id);
      const existing = await loadOwned(repositories.schedules, id, context, "schedule entry");
      if (input.courseId !== undefined) await requireParent(repositories.courses, input.courseId, context, "course");
      return repositories.schedules.update(updateEntity(dependencies, existing, input, updateScheduleEntryInputSchema, scheduleEntrySchema));
    },
    async deleteScheduleEntry(context, rawId) {
      const id = parseApplicationInput(scheduleEntryIdSchema, rawId);
      await loadOwned(repositories.schedules, id, context, "schedule entry");
      return repositories.schedules.delete(id, validateContext(context).ownerId);
    },
    async getScheduleEntry(context, rawId) {
      const id = parseApplicationInput(scheduleEntryIdSchema, rawId);
      return findOwned(repositories.schedules, id, context, "schedule entry");
    },
    async listScheduleEntries(context, query = {}) {
      const parsed = parseApplicationInput(scheduleEntryQuerySchema, ownerQuery(context, query));
      return sortedPage(await repositories.schedules.findMany(parsed), (a, b) => stableTextCompare(a.startsAt, b.startsAt, a.id, b.id), parsed.sortDirection);
    },

    async createResource(context, input) {
      const parsed = parseCreateInput(context, input, createResourceInputSchema);
      await validateCourseTopic(context, parsed.courseId, parsed.topicId);
      return repositories.resources.create(materializeEntity(dependencies, parsed, learningResourceSchema));
    },
    async updateResource(context, input) {
      const id = parseApplicationInput(resourceIdSchema, input.id);
      const existing = await loadOwned(repositories.resources, id, context, "resource");
      if (existing.status === "archived") invalidTransition("resource", id, "archived", input.status ?? "updated");
      if (input.status === "archived") invalidTransition("resource", id, existing.status, "archived-through-update");
      await validateCourseTopic(context, input.courseId ?? existing.courseId, input.topicId ?? existing.topicId);
      return repositories.resources.update(updateEntity(dependencies, existing, input, updateResourceInputSchema, learningResourceSchema));
    },
    async archiveResource(context, rawId) {
      const id = parseApplicationInput(resourceIdSchema, rawId);
      const existing = await loadOwned(repositories.resources, id, context, "resource");
      if (existing.status === "archived") return existing;
      return repositories.resources.update(updateEntity(dependencies, existing, { id, status: "archived" }, updateResourceInputSchema, learningResourceSchema));
    },
    async getResource(context, rawId) {
      const id = parseApplicationInput(resourceIdSchema, rawId);
      return findOwned(repositories.resources, id, context, "resource");
    },
    async listResourcesByCourse(context, query) {
      const parsed = parseApplicationInput(resourcesByCourseQuerySchema, ownerQuery(context, query));
      await requireParent(repositories.courses, parsed.courseId, context, "course");
      return sortedPage(await repositories.resources.findMany(parsed), (a, b) => stableTextCompare(a.title, b.title, a.id, b.id), parsed.sortDirection);
    },

    async createCertificate(context, input) {
      const parsed = parseCreateInput(context, input, createCertificateInputSchema);
      if (parsed.institutionId !== undefined) await requireParent(repositories.institutions, parsed.institutionId, context, "institution");
      if (parsed.programId !== undefined) await requireParent(repositories.programs, parsed.programId, context, "program");
      if (parsed.courseId !== undefined) await requireParent(repositories.courses, parsed.courseId, context, "course");
      return repositories.certificates.create(materializeEntity(dependencies, parsed, certificateSchema));
    },
    async updateCertificate(context, input) {
      const id = parseApplicationInput(certificateIdSchema, input.id);
      const existing = await loadOwned(repositories.certificates, id, context, "certificate");
      if (input.institutionId !== undefined) await requireParent(repositories.institutions, input.institutionId, context, "institution");
      if (input.programId !== undefined) await requireParent(repositories.programs, input.programId, context, "program");
      if (input.courseId !== undefined) await requireParent(repositories.courses, input.courseId, context, "course");
      return repositories.certificates.update(updateEntity(dependencies, existing, input, updateCertificateInputSchema, certificateSchema));
    },
    async deleteCertificate(context, rawId) {
      const id = parseApplicationInput(certificateIdSchema, rawId);
      await loadOwned(repositories.certificates, id, context, "certificate");
      return repositories.certificates.delete(id, validateContext(context).ownerId);
    },
    async getCertificate(context, rawId) {
      const id = parseApplicationInput(certificateIdSchema, rawId);
      return findOwned(repositories.certificates, id, context, "certificate");
    },
    async listCertificates(context, query = {}) {
      const parsed = parseApplicationInput(certificateQuerySchema, ownerQuery(context, query));
      return sortedPage(await repositories.certificates.findMany(parsed), (a, b) => stableTextCompare(a.issuedOn, b.issuedOn, a.id, b.id), parsed.sortDirection ?? "descending");
    },

    async createEducationGoal(context, input) {
      const parsed = parseCreateInput(context, input, createEducationGoalInputSchema);
      if (parsed.status !== "planned" && parsed.status !== "active") invalidTransition("education goal", "new", "new", parsed.status);
      await validateGoalScope(context, parsed);
      return repositories.goals.create(materializeEntity(dependencies, parsed, educationGoalSchema));
    },
    async updateEducationGoal(context, input) {
      const id = parseApplicationInput(educationGoalIdSchema, input.id);
      const existing = await loadOwned(repositories.goals, id, context, "education goal");
      if (existing.status === "completed" || existing.status === "archived") invalidTransition("education goal", id, existing.status, "updated");
      if (input.status === "completed" || input.status === "archived") invalidTransition("education goal", id, existing.status, `${input.status}-through-update`);
      await validateGoalScope(context, {
        ...(input.programId !== undefined ? { programId: input.programId } : existing.programId !== undefined ? { programId: existing.programId } : {}),
        ...(input.semesterId !== undefined ? { semesterId: input.semesterId } : existing.semesterId !== undefined ? { semesterId: existing.semesterId } : {}),
        ...(input.courseId !== undefined ? { courseId: input.courseId } : existing.courseId !== undefined ? { courseId: existing.courseId } : {}),
      });
      return repositories.goals.update(updateEntity(dependencies, existing, input, updateEducationGoalInputSchema, educationGoalSchema));
    },
    async completeEducationGoal(context, rawId) {
      const id = parseApplicationInput(educationGoalIdSchema, rawId);
      const existing = await loadOwned(repositories.goals, id, context, "education goal");
      if (existing.status === "completed") return existing;
      if (existing.status === "archived") invalidTransition("education goal", id, "archived", "completed");
      return repositories.goals.update(updateEntity(dependencies, existing, { id, status: "completed", completedAt: dependencies.clock.now() }, updateEducationGoalInputSchema, educationGoalSchema));
    },
    async archiveEducationGoal(context, rawId) {
      const id = parseApplicationInput(educationGoalIdSchema, rawId);
      const existing = await loadOwned(repositories.goals, id, context, "education goal");
      if (existing.status === "archived") return existing;
      return repositories.goals.update(updateEntity(dependencies, existing, { id, status: "archived" }, updateEducationGoalInputSchema, educationGoalSchema));
    },
    async getEducationGoal(context, rawId) {
      const id = parseApplicationInput(educationGoalIdSchema, rawId);
      return findOwned(repositories.goals, id, context, "education goal");
    },
    async listEducationGoals(context, query = {}) {
      const parsed = parseApplicationInput(educationGoalQuerySchema, ownerQuery(context, query));
      return sortedPage(await repositories.goals.findMany(parsed), (a, b) => stableTextCompare(a.targetDate, b.targetDate, a.id, b.id), parsed.sortDirection);
    },
  };
}
