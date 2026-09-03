import type { EducationServiceDependencies } from "../dependencies.js";
import type { EducationService } from "../../services/education-service.types.js";
import {
  academicProgramSchema,
  createProgramInputSchema,
  programIdSchema,
  programQuerySchema,
  updateProgramInputSchema,
} from "../../programs/program.types.js";
import {
  createInstitutionInputSchema,
  institutionIdSchema,
  institutionQuerySchema,
  institutionSchema,
  updateInstitutionInputSchema,
} from "../../institutions/institution.types.js";
import {
  createSemesterInputSchema,
  semesterIdSchema,
  semesterQuerySchema,
  semesterSchema,
  updateSemesterInputSchema,
} from "../../semesters/semester.types.js";
import {
  courseIdSchema,
  courseQuerySchema,
  courseSchema,
  coursesBySemesterQuerySchema,
  createCourseInputSchema,
  updateCourseInputSchema,
} from "../../courses/course.types.js";
import {
  courseTopicSchema,
  createTopicInputSchema,
  topicIdSchema,
  topicQuerySchema,
  updateTopicInputSchema,
} from "../../topics/topic.types.js";
import {
  conflict,
  findOwned,
  invalidTransition,
  loadOwned,
  materializeEntity,
  ownerQuery,
  parseApplicationInput,
  parseCreateInput,
  relatedRecords,
  requireParent,
  sortedPage,
  stableTextCompare,
  updateEntity,
  validateContext,
} from "../application.helpers.js";

type AcademicStructureMethods = Pick<EducationService,
  | "createInstitution" | "updateInstitution" | "archiveInstitution" | "getInstitution" | "listInstitutions"
  | "createProgram" | "updateProgram" | "archiveProgram" | "getProgram" | "listPrograms"
  | "createSemester" | "updateSemester" | "activateSemester" | "completeSemester" | "getSemester" | "listSemesters"
  | "createCourse" | "updateCourse" | "archiveCourse" | "getCourse" | "listCourses" | "listCoursesBySemester"
  | "createTopic" | "updateTopic" | "markTopicComplete" | "getTopic" | "listTopicsByCourse"
>;

export function createAcademicStructureUseCases(dependencies: EducationServiceDependencies): AcademicStructureMethods {
  const repositories = dependencies.repositories;

  return {
    async createInstitution(context, input) {
      const parsed = parseCreateInput(context, input, createInstitutionInputSchema);
      const entity = materializeEntity(dependencies, parsed, institutionSchema);
      return repositories.institutions.create(entity);
    },
    async updateInstitution(context, input) {
      const id = parseApplicationInput(institutionIdSchema, input.id);
      const existing = await loadOwned(repositories.institutions, id, context, "institution");
      if (existing.status === "archived") invalidTransition("institution", id, "archived", input.status ?? "updated");
      if (input.status === "archived") invalidTransition("institution", id, existing.status, "archived-through-update");
      return repositories.institutions.update(updateEntity(dependencies, existing, input, updateInstitutionInputSchema, institutionSchema));
    },
    async archiveInstitution(context, rawId) {
      const id = parseApplicationInput(institutionIdSchema, rawId);
      const existing = await loadOwned(repositories.institutions, id, context, "institution");
      if (existing.status === "archived") return existing;
      const { ownerId } = validateContext(context);
      const programs = await repositories.programs.findMany({ ownerId, institutionId: id, status: "active", limit: 1 });
      if (programs.items.length > 0) relatedRecords("institution", id, "An institution with active programs cannot be archived.");
      return repositories.institutions.update(updateEntity(dependencies, existing, { id, status: "archived" }, updateInstitutionInputSchema, institutionSchema));
    },
    async getInstitution(context, rawId) {
      const id = parseApplicationInput(institutionIdSchema, rawId);
      return findOwned(repositories.institutions, id, context, "institution");
    },
    async listInstitutions(context, query = {}) {
      const parsed = parseApplicationInput(institutionQuerySchema, ownerQuery(context, query));
      return sortedPage(await repositories.institutions.findMany(parsed), (a, b) => stableTextCompare(a.name, b.name, a.id, b.id), parsed.sortDirection);
    },

    async createProgram(context, input) {
      const parsed = parseCreateInput(context, input, createProgramInputSchema);
      await requireParent(repositories.institutions, parsed.institutionId, context, "institution");
      return repositories.programs.create(materializeEntity(dependencies, parsed, academicProgramSchema));
    },
    async updateProgram(context, input) {
      const id = parseApplicationInput(programIdSchema, input.id);
      const existing = await loadOwned(repositories.programs, id, context, "program");
      if (existing.status === "archived") invalidTransition("program", id, "archived", input.status ?? "updated");
      if (input.status === "archived") invalidTransition("program", id, existing.status, "archived-through-update");
      if (input.institutionId !== undefined) await requireParent(repositories.institutions, input.institutionId, context, "institution");
      return repositories.programs.update(updateEntity(dependencies, existing, input, updateProgramInputSchema, academicProgramSchema));
    },
    async archiveProgram(context, rawId) {
      const id = parseApplicationInput(programIdSchema, rawId);
      const existing = await loadOwned(repositories.programs, id, context, "program");
      if (existing.status === "archived") return existing;
      const { ownerId } = validateContext(context);
      const semesters = await repositories.semesters.findMany({ ownerId, programId: id, status: "active", limit: 1 });
      if (semesters.items.length > 0) relatedRecords("program", id, "A program with an active semester cannot be archived.");
      return repositories.programs.update(updateEntity(dependencies, existing, { id, status: "archived" }, updateProgramInputSchema, academicProgramSchema));
    },
    async getProgram(context, rawId) {
      const id = parseApplicationInput(programIdSchema, rawId);
      return findOwned(repositories.programs, id, context, "program");
    },
    async listPrograms(context, query = {}) {
      const parsed = parseApplicationInput(programQuerySchema, ownerQuery(context, query));
      return sortedPage(await repositories.programs.findMany(parsed), (a, b) => stableTextCompare(a.name, b.name, a.id, b.id), parsed.sortDirection);
    },

    async createSemester(context, input) {
      const parsed = parseCreateInput(context, input, createSemesterInputSchema);
      if (parsed.status !== "planned") invalidTransition("semester", "new", "new", parsed.status);
      await requireParent(repositories.programs, parsed.programId, context, "program");
      return repositories.semesters.create(materializeEntity(dependencies, parsed, semesterSchema));
    },
    async updateSemester(context, input) {
      const id = parseApplicationInput(semesterIdSchema, input.id);
      const existing = await loadOwned(repositories.semesters, id, context, "semester");
      if (input.status !== undefined && input.status !== existing.status) invalidTransition("semester", id, existing.status, input.status);
      if (existing.status === "completed") invalidTransition("semester", id, "completed", "updated");
      if (input.programId !== undefined) await requireParent(repositories.programs, input.programId, context, "program");
      return repositories.semesters.update(updateEntity(dependencies, existing, input, updateSemesterInputSchema, semesterSchema));
    },
    async activateSemester(context, rawId) {
      const id = parseApplicationInput(semesterIdSchema, rawId);
      const existing = await loadOwned(repositories.semesters, id, context, "semester");
      if (existing.status === "active") return existing;
      if (existing.status !== "planned") invalidTransition("semester", id, existing.status, "active");
      const { ownerId } = validateContext(context);
      const active = await repositories.semesters.findMany({ ownerId, programId: existing.programId, status: "active", limit: 2 });
      if (active.items.some((semester) => semester.id !== id)) conflict("semester", id, "Only one semester per program may be active.");
      return repositories.semesters.update(updateEntity(dependencies, existing, { id, status: "active" }, updateSemesterInputSchema, semesterSchema));
    },
    async completeSemester(context, rawId) {
      const id = parseApplicationInput(semesterIdSchema, rawId);
      const existing = await loadOwned(repositories.semesters, id, context, "semester");
      if (existing.status === "completed") return existing;
      if (existing.status !== "active") invalidTransition("semester", id, existing.status, "completed");
      return repositories.semesters.update(updateEntity(dependencies, existing, { id, status: "completed" }, updateSemesterInputSchema, semesterSchema));
    },
    async getSemester(context, rawId) {
      const id = parseApplicationInput(semesterIdSchema, rawId);
      return findOwned(repositories.semesters, id, context, "semester");
    },
    async listSemesters(context, query = {}) {
      const parsed = parseApplicationInput(semesterQuerySchema, ownerQuery(context, query));
      return sortedPage(await repositories.semesters.findMany(parsed), (a, b) => a.sequence - b.sequence || stableTextCompare(a.startsOn, b.startsOn, a.id, b.id), parsed.sortDirection);
    },

    async createCourse(context, input) {
      const parsed = parseCreateInput(context, input, createCourseInputSchema);
      await requireParent(repositories.semesters, parsed.semesterId, context, "semester");
      if (parsed.code !== undefined) {
        const duplicate = await repositories.courses.findByCode(parsed.ownerId, parsed.semesterId, parsed.code);
        if (duplicate !== null) conflict("course", duplicate.id, "Course codes must be unique within a semester.");
      }
      return repositories.courses.create(materializeEntity(dependencies, parsed, courseSchema));
    },
    async updateCourse(context, input) {
      const id = parseApplicationInput(courseIdSchema, input.id);
      const existing = await loadOwned(repositories.courses, id, context, "course");
      if (existing.status === "archived") invalidTransition("course", id, "archived", input.status ?? "updated");
      if (input.status === "archived") invalidTransition("course", id, existing.status, "archived-through-update");
      const semesterId = input.semesterId ?? existing.semesterId;
      if (input.semesterId !== undefined) await requireParent(repositories.semesters, input.semesterId, context, "semester");
      const code = input.code ?? existing.code;
      if (code !== undefined && (input.code !== undefined || input.semesterId !== undefined)) {
        const duplicate = await repositories.courses.findByCode(existing.ownerId, semesterId, code);
        if (duplicate !== null && duplicate.id !== id) conflict("course", duplicate.id, "Course codes must be unique within a semester.");
      }
      return repositories.courses.update(updateEntity(dependencies, existing, input, updateCourseInputSchema, courseSchema));
    },
    async archiveCourse(context, rawId) {
      const id = parseApplicationInput(courseIdSchema, rawId);
      const existing = await loadOwned(repositories.courses, id, context, "course");
      if (existing.status === "archived") return existing;
      return repositories.courses.update(updateEntity(dependencies, existing, { id, status: "archived" }, updateCourseInputSchema, courseSchema));
    },
    async getCourse(context, rawId) {
      const id = parseApplicationInput(courseIdSchema, rawId);
      return findOwned(repositories.courses, id, context, "course");
    },
    async listCourses(context, query = {}) {
      const parsed = parseApplicationInput(courseQuerySchema, ownerQuery(context, query));
      return sortedPage(await repositories.courses.findMany(parsed), (a, b) => stableTextCompare(a.name, b.name, a.id, b.id), parsed.sortDirection);
    },
    async listCoursesBySemester(context, query) {
      const parsed = parseApplicationInput(coursesBySemesterQuerySchema, ownerQuery(context, query));
      await requireParent(repositories.semesters, parsed.semesterId, context, "semester");
      return sortedPage(await repositories.courses.findMany(parsed), (a, b) => stableTextCompare(a.code ?? a.name, b.code ?? b.name, a.id, b.id), parsed.sortDirection);
    },

    async createTopic(context, input) {
      const parsed = parseCreateInput(context, input, createTopicInputSchema);
      await requireParent(repositories.courses, parsed.courseId, context, "course");
      if (parsed.parentTopicId !== undefined) {
        const parent = await requireParent(repositories.topics, parsed.parentTopicId, context, "topic");
        if (parent.courseId !== parsed.courseId) conflict("topic", parsed.parentTopicId, "A parent topic must belong to the same course.");
      }
      return repositories.topics.create(materializeEntity(dependencies, parsed, courseTopicSchema));
    },
    async updateTopic(context, input) {
      const id = parseApplicationInput(topicIdSchema, input.id);
      const existing = await loadOwned(repositories.topics, id, context, "topic");
      if (existing.status === "completed") invalidTransition("topic", id, "completed", input.status ?? "updated");
      if (input.status === "completed") invalidTransition("topic", id, existing.status, "completed-through-update");
      const courseId = input.courseId ?? existing.courseId;
      if (input.courseId !== undefined) await requireParent(repositories.courses, input.courseId, context, "course");
      if (input.parentTopicId === id) conflict("topic", id, "A topic cannot be its own parent.");
      if (input.parentTopicId !== undefined) {
        const parent = await requireParent(repositories.topics, input.parentTopicId, context, "topic");
        if (parent.courseId !== courseId) conflict("topic", input.parentTopicId, "A parent topic must belong to the same course.");
      }
      return repositories.topics.update(updateEntity(dependencies, existing, input, updateTopicInputSchema, courseTopicSchema));
    },
    async markTopicComplete(context, rawId) {
      const id = parseApplicationInput(topicIdSchema, rawId);
      const existing = await loadOwned(repositories.topics, id, context, "topic");
      if (existing.status === "completed") return existing;
      return repositories.topics.update(updateEntity(dependencies, existing, { id, status: "completed", completedAt: dependencies.clock.now() }, updateTopicInputSchema, courseTopicSchema));
    },
    async getTopic(context, rawId) {
      const id = parseApplicationInput(topicIdSchema, rawId);
      return findOwned(repositories.topics, id, context, "topic");
    },
    async listTopicsByCourse(context, query) {
      const parsed = parseApplicationInput(topicQuerySchema, ownerQuery(context, query));
      await requireParent(repositories.courses, parsed.courseId, context, "course");
      return sortedPage(await repositories.topics.findMany(parsed), (a, b) => a.sequence - b.sequence || stableTextCompare(undefined, undefined, a.id, b.id), parsed.sortDirection);
    },
  };
}
