import { describe, expect, it } from "vitest";

import {
  EducationApplicationError,
  createEducationService,
} from "../src/index.js";
import type {
  AcademicProgram,
  Assignment,
  AttendanceRecord,
  Certificate,
  Course,
  CourseTopic,
  EducationGoal,
  EducationRepository,
  EducationService,
  Exam,
  Grade,
  Institution,
  LearningResource,
  OwnerId,
  PageResult,
  ScheduleEntry,
  Semester,
  StudySession,
} from "../src/index.js";

const OWNER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OWNER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const NOW = "2026-09-03T08:00:00Z";

interface StoredRecord {
  readonly id: string;
  readonly ownerId: string;
}

class TestRepository<TEntity extends StoredRecord> {
  public readonly records: TEntity[] = [];

  public async findById(id: string, ownerId: OwnerId): Promise<TEntity | null> {
    return this.records.find((record) => record.id === id && record.ownerId === ownerId) ?? null;
  }

  public async findMany(filter: object): Promise<PageResult<TEntity>> {
    const values = filter as Readonly<Record<string, unknown>>;
    return { items: this.records.filter((record) => matchesFilter(record, values)) };
  }

  public async create(entity: TEntity): Promise<TEntity> {
    this.records.push(entity);
    return entity;
  }

  public async update(entity: TEntity): Promise<TEntity> {
    const index = this.records.findIndex((record) => record.id === entity.id && record.ownerId === entity.ownerId);
    if (index >= 0) this.records[index] = entity;
    return entity;
  }

  public async delete(id: string, ownerId: OwnerId): Promise<void> {
    const index = this.records.findIndex((record) => record.id === id && record.ownerId === ownerId);
    if (index >= 0) this.records.splice(index, 1);
  }
}

function field(record: StoredRecord, name: string): unknown {
  return (record as unknown as Readonly<Record<string, unknown>>)[name];
}

function matchesFilter(record: StoredRecord, filter: Readonly<Record<string, unknown>>): boolean {
  for (const [key, expected] of Object.entries(filter)) {
    if (expected === undefined || ["limit", "cursor", "sortDirection", "search"].includes(key)) continue;
    if (key === "dueFrom" && String(field(record, "dueAt") ?? "") < String(expected)) return false;
    else if (key === "dueTo" && String(field(record, "dueAt") ?? "") > String(expected)) return false;
    else if (key === "startsAfter") {
      const actual = field(record, "scheduledStartsAt") ?? field(record, "plannedStartsAt") ?? field(record, "startsAt");
      if (String(actual ?? "") < String(expected)) return false;
    } else if (key === "startsBefore") {
      const actual = field(record, "scheduledStartsAt") ?? field(record, "plannedStartsAt") ?? field(record, "startsAt");
      if (String(actual ?? "") > String(expected)) return false;
    } else if (key === "endsAfter") {
      const actual = field(record, "endsAt") ?? field(record, "plannedEndsAt");
      if (String(actual ?? "") < String(expected)) return false;
    } else if (key === "dateFrom" && String(field(record, "sessionDate") ?? "") < String(expected)) return false;
    else if (key === "dateTo" && String(field(record, "sessionDate") ?? "") > String(expected)) return false;
    else if (!key.endsWith("From") && !key.endsWith("To") && field(record, key) !== expected) return false;
  }
  return true;
}

interface Harness {
  readonly service: EducationService;
  setNow(value: string): void;
  readonly repositories: {
    readonly institutions: TestRepository<Institution>;
    readonly programs: TestRepository<AcademicProgram>;
    readonly semesters: TestRepository<Semester>;
    readonly courses: TestRepository<Course>;
    readonly topics: TestRepository<CourseTopic>;
    readonly assignments: TestRepository<Assignment>;
    readonly exams: TestRepository<Exam>;
    readonly grades: TestRepository<Grade>;
    readonly attendance: TestRepository<AttendanceRecord>;
    readonly studySessions: TestRepository<StudySession>;
    readonly schedules: TestRepository<ScheduleEntry>;
    readonly resources: TestRepository<LearningResource>;
    readonly certificates: TestRepository<Certificate>;
    readonly goals: TestRepository<EducationGoal>;
  };
}

function createHarness(): Harness {
  const repositories = {
    institutions: new TestRepository<Institution>(),
    programs: new TestRepository<AcademicProgram>(),
    semesters: new TestRepository<Semester>(),
    courses: new TestRepository<Course>(),
    topics: new TestRepository<CourseTopic>(),
    assignments: new TestRepository<Assignment>(),
    exams: new TestRepository<Exam>(),
    grades: new TestRepository<Grade>(),
    attendance: new TestRepository<AttendanceRecord>(),
    studySessions: new TestRepository<StudySession>(),
    schedules: new TestRepository<ScheduleEntry>(),
    resources: new TestRepository<LearningResource>(),
    certificates: new TestRepository<Certificate>(),
    goals: new TestRepository<EducationGoal>(),
  };
  let nextId = 1;
  let currentTime = NOW;
  const repositoryContract = {
    ...repositories,
    courses: Object.assign(repositories.courses, {
      findByCode: async (ownerId: string, semesterId: string, code: string) => repositories.courses.records.find((course) => course.ownerId === ownerId && course.semesterId === semesterId && course.code === code) ?? null,
    }),
    grades: Object.assign(repositories.grades, {
      findManyBySemester: async (query: object) => repositories.grades.findMany(query),
      findForGradeable: async (ownerId: string, courseId: string, assignmentId?: string, examId?: string) => repositories.grades.records.find((grade) => grade.ownerId === ownerId && grade.courseId === courseId && grade.assignmentId === assignmentId && grade.examId === examId) ?? null,
    }),
    attendance: Object.assign(repositories.attendance, {
      findByCourseAndSessionDate: async (ownerId: string, courseId: string, sessionDate: string) => repositories.attendance.records.find((record) => record.ownerId === ownerId && record.courseId === courseId && record.sessionDate === sessionDate) ?? null,
    }),
  } as unknown as EducationRepository;
  return {
    repositories,
    setNow(value) { currentTime = value; },
    service: createEducationService({
      repositories: repositoryContract,
      clock: { now: () => currentTime },
      idGenerator: { generate: () => `00000000-0000-4000-8000-${String(nextId++).padStart(12, "0")}` },
    }),
  };
}

async function createCore(service: EducationService, ownerId = OWNER_A) {
  const context = { ownerId };
  const institution = await service.createInstitution(context, { name: "Aperture University", type: "university", status: "active" });
  const program = await service.createProgram(context, { institutionId: institution.id, name: "Computer Science", programType: "degree", startsOn: "2026-01-01", requiredCredits: "120", status: "active" });
  const semester = await service.createSemester(context, { programId: program.id, name: "Semester 1", academicYear: "2026", sequence: 1, startsOn: "2026-01-01", endsOn: "2026-12-31", status: "planned" });
  const activeSemester = await service.activateSemester(context, semester.id);
  const course = await service.createCourse(context, { semesterId: semester.id, code: "CS101", name: "Foundations", credits: "3", deliveryMode: "in_person", status: "active" });
  return { context, institution, program, semester: activeSemester, course };
}

async function expectApplicationError(action: () => Promise<unknown>, code: EducationApplicationError["code"]): Promise<void> {
  try {
    await action();
    throw new Error("Expected application error.");
  } catch (error) {
    expect(error).toBeInstanceOf(EducationApplicationError);
    expect((error as EducationApplicationError).code).toBe(code);
    expect((error as Error).message).not.toContain("[object Object]");
  }
}

describe("Education application workflows", () => {
  it("creates all fourteen entity groups with injected IDs, owner, and timestamps", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    const topic = await service.createTopic(core.context, { courseId: core.course.id, title: "Types", sequence: 1, status: "planned" });
    const assignment = await service.createAssignment(core.context, { courseId: core.course.id, topicId: topic.id, title: "Essay", dueAt: "2026-10-01T08:00:00Z", priority: "normal", status: "assigned" });
    const exam = await service.createExam(core.context, { courseId: core.course.id, semesterId: core.semester.id, title: "Final", examType: "final", scheduledStartsAt: "2026-11-01T08:00:00Z", scheduledEndsAt: "2026-11-01T10:00:00Z", status: "scheduled" });
    const grade = await service.recordGrade(core.context, { courseId: core.course.id, assignmentId: assignment.id, sourceType: "assignment", title: "Essay grade", scoreEarned: "80", maximumScore: "100", gradePoints: "3.5", weightPercentage: "40", recordedAt: NOW });
    const attendance = await service.recordAttendance(core.context, { courseId: core.course.id, sessionDate: "2026-09-03", status: "present", source: "manual" });
    const study = await service.scheduleStudySession(core.context, { courseId: core.course.id, topicId: topic.id, title: "Review", plannedStartsAt: "2026-09-04T08:00:00Z", plannedDurationMinutes: 60, method: "review", status: "scheduled" });
    const schedule = await service.createScheduleEntry(core.context, { courseId: core.course.id, title: "Class", startsAt: "2026-09-05T08:00:00Z", endsAt: "2026-09-05T09:00:00Z", entryType: "class", status: "scheduled" });
    const resource = await service.createResource(core.context, { courseId: core.course.id, topicId: topic.id, title: "Handbook", type: "book", status: "active" });
    const certificate = await service.createCertificate(core.context, { courseId: core.course.id, name: "Completion", issuingOrganization: "Aperture", status: "planned" });
    const goal = await service.createEducationGoal(core.context, { courseId: core.course.id, title: "Finish", goalType: "completion", status: "active" });

    for (const entity of [core.institution, core.program, core.semester, core.course, topic, assignment, exam, grade, attendance, study, schedule, resource, certificate, goal]) {
      expect(entity.ownerId).toBe(OWNER_A);
      expect(entity.id).toMatch(/^[0-9a-f-]{36}$/);
      expect(entity.createdAt).toBe(NOW);
      expect(entity.updatedAt).toBe(NOW);
      expect(Object.isFrozen(entity)).toBe(true);
    }
    expect(core.institution.id).toBe("00000000-0000-4000-8000-000000000001");
  });

  it("rejects invalid input, payload owner assignment, missing parents, and owner-hidden parents", async () => {
    const { service } = createHarness();
    await expectApplicationError(() => service.createInstitution({ ownerId: OWNER_A }, { name: "", type: "university", status: "active" }), "education-validation-failed");
    await expectApplicationError(() => service.createInstitution({ ownerId: OWNER_A }, { name: "X", type: "university", status: "active", ownerId: OWNER_B } as never), "education-owner-mismatch");
    const missingId = "99999999-9999-4999-8999-999999999999";
    await expectApplicationError(() => service.createProgram({ ownerId: OWNER_A }, { institutionId: missingId, name: "X", programType: "degree", startsOn: "2026-01-01", status: "active" }), "education-parent-not-found");
    const other = await service.createInstitution({ ownerId: OWNER_B }, { name: "Other", type: "college", status: "active" });
    await expectApplicationError(() => service.createProgram({ ownerId: OWNER_A }, { institutionId: other.id, name: "X", programType: "degree", startsOn: "2026-01-01", status: "active" }), "education-parent-not-found");
    await expectApplicationError(() => service.updateInstitution({ ownerId: OWNER_A }, { id: missingId, name: "Missing" }), "education-record-not-found");
  });

  it("preserves immutable metadata and does not mutate update input", async () => {
    const { service, setNow } = createHarness();
    const institution = await service.createInstitution({ ownerId: OWNER_A }, { name: "Before", type: "university", status: "active" });
    const input = Object.freeze({ id: institution.id, name: "After" });
    setNow("2026-09-04T09:30:00Z");
    const updated = await service.updateInstitution({ ownerId: OWNER_A }, input);
    expect(updated).toMatchObject({ id: institution.id, ownerId: OWNER_A, createdAt: NOW, updatedAt: "2026-09-04T09:30:00Z", name: "After" });
    expect(input.name).toBe("After");
    await expectApplicationError(() => service.updateInstitution({ ownerId: OWNER_A }, { ...input, ownerId: OWNER_B } as never), "education-owner-mismatch");
  });

  it("blocks institution and program archival while active children exist and makes archives idempotent", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    await expectApplicationError(() => service.archiveInstitution(core.context, core.institution.id), "education-related-records-exist");
    await expectApplicationError(() => service.archiveProgram(core.context, core.program.id), "education-related-records-exist");
    const standalone = await service.createInstitution(core.context, { name: "Standalone", type: "other", status: "active" });
    const archived = await service.archiveInstitution(core.context, standalone.id);
    expect(archived.status).toBe("archived");
    expect(await service.archiveInstitution(core.context, standalone.id)).toBe(archived);
  });

  it("enforces one active semester and terminal semester transitions", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    const second = await service.createSemester(core.context, { programId: core.program.id, name: "Semester 2", academicYear: "2026", sequence: 2, startsOn: "2026-06-01", endsOn: "2026-12-31", status: "planned" });
    await expectApplicationError(() => service.activateSemester(core.context, second.id), "education-conflict");
    const complete = await service.completeSemester(core.context, core.semester.id);
    expect(complete.status).toBe("completed");
    await expectApplicationError(() => service.activateSemester(core.context, complete.id), "education-invalid-state-transition");
  });

  it("enforces course-code uniqueness and deterministic course/topic ordering", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    await expectApplicationError(() => service.createCourse(core.context, { semesterId: core.semester.id, code: "CS101", name: "Duplicate", deliveryMode: "online", status: "planned" }), "education-conflict");
    const courseB = await service.createCourse(core.context, { semesterId: core.semester.id, code: "AA100", name: "Alpha", deliveryMode: "online", status: "planned" });
    const topicB = await service.createTopic(core.context, { courseId: core.course.id, title: "Second", sequence: 2, status: "planned" });
    const topicA = await service.createTopic(core.context, { courseId: core.course.id, title: "First", sequence: 1, status: "planned" });
    expect((await service.listCoursesBySemester(core.context, { semesterId: core.semester.id })).items.map((course) => course.id)).toEqual([courseB.id, core.course.id]);
    expect((await service.listTopicsByCourse(core.context, { courseId: core.course.id })).items.map((topic) => topic.id)).toEqual([topicA.id, topicB.id]);
  });

  it("rejects a topic parent from another course and completes a topic idempotently", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    const otherCourse = await service.createCourse(core.context, { semesterId: core.semester.id, code: "CS102", name: "Other", deliveryMode: "online", status: "active" });
    const parent = await service.createTopic(core.context, { courseId: otherCourse.id, title: "Parent", sequence: 1, status: "planned" });
    await expectApplicationError(() => service.createTopic(core.context, { courseId: core.course.id, parentTopicId: parent.id, title: "Child", sequence: 1, status: "planned" }), "education-conflict");
    const completed = await service.markTopicComplete(core.context, parent.id);
    expect(completed).toMatchObject({ status: "completed", completedAt: NOW });
    expect(await service.markTopicComplete(core.context, parent.id)).toBe(completed);
  });

  it("enforces assignment lifecycle and excludes completed/cancelled upcoming work", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    const completed = await service.createAssignment(core.context, { courseId: core.course.id, title: "Completed", dueAt: "2026-10-01T08:00:00Z", priority: "normal", status: "assigned" });
    await service.markAssignmentComplete(core.context, (await service.submitAssignment(core.context, completed.id)).id);
    const cancelled = await service.createAssignment(core.context, { courseId: core.course.id, title: "Cancelled", dueAt: "2026-10-02T08:00:00Z", priority: "normal", status: "assigned" });
    await service.updateAssignment(core.context, { id: cancelled.id, status: "cancelled" });
    const active = await service.createAssignment(core.context, { courseId: core.course.id, title: "Active", dueAt: "2026-09-20T08:00:00Z", priority: "high", status: "assigned" });
    const upcoming = await service.getUpcomingAssignments(core.context);
    expect(upcoming.items.map((item) => item.id)).toEqual([active.id]);
    await expectApplicationError(() => service.submitAssignment(core.context, cancelled.id), "education-invalid-state-transition");
  });

  it("excludes completed and cancelled exams from upcoming results", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    const exam = (title: string) => ({ courseId: core.course.id, title, examType: "quiz" as const, scheduledStartsAt: "2026-10-01T08:00:00Z", scheduledEndsAt: "2026-10-01T09:00:00Z", status: "scheduled" as const });
    const completed = await service.createExam(core.context, exam("Completed"));
    await service.completeExam(core.context, completed.id);
    const cancelled = await service.createExam(core.context, exam("Cancelled"));
    await service.updateExam(core.context, { id: cancelled.id, status: "cancelled" });
    const active = await service.createExam(core.context, exam("Active"));
    expect((await service.getUpcomingExams(core.context)).items.map((item) => item.id)).toEqual([active.id]);
  });

  it("rejects cross-course and duplicate grades", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    const otherCourse = await service.createCourse(core.context, { semesterId: core.semester.id, code: "CS102", name: "Other", deliveryMode: "online", status: "active" });
    const assignment = await service.createAssignment(core.context, { courseId: otherCourse.id, title: "Other task", priority: "normal", status: "assigned" });
    const gradeInput = { courseId: core.course.id, assignmentId: assignment.id, sourceType: "assignment" as const, title: "Grade", scoreEarned: "10", maximumScore: "10", recordedAt: NOW };
    await expectApplicationError(() => service.recordGrade(core.context, gradeInput), "education-conflict");
    const ownAssignment = await service.createAssignment(core.context, { courseId: core.course.id, title: "Task", priority: "normal", status: "assigned" });
    const ownGrade = { ...gradeInput, assignmentId: ownAssignment.id };
    await service.recordGrade(core.context, ownGrade);
    await expectApplicationError(() => service.recordGrade(core.context, ownGrade), "education-conflict");
  });

  it("rejects duplicate attendance and delegates summaries to the Phase 6 calculator", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    const input = { courseId: core.course.id, sessionDate: "2026-09-03", status: "present" as const, source: "manual" as const };
    await service.recordAttendance(core.context, input);
    await expectApplicationError(() => service.recordAttendance(core.context, input), "education-conflict");
    await service.recordAttendance(core.context, { ...input, sessionDate: "2026-09-04", status: "absent" });
    const summary = await service.getCourseAttendanceSummary(core.context, core.course.id, "exclude");
    expect(summary.calculation).toMatchObject({ exactAttendancePercentage: "50", attendedSessions: 1, eligibleSessions: 2, excusedPolicy: "exclude" });
  });

  it("uses the injected clock for study and goal transitions and prevents restart", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    const session = await service.scheduleStudySession(core.context, { courseId: core.course.id, title: "Study", plannedStartsAt: NOW, actualDurationMinutes: 45, method: "review", status: "scheduled" });
    const started = await service.startStudySession(core.context, session.id);
    expect(started.actualStartsAt).toBe(NOW);
    const completed = await service.completeStudySession(core.context, session.id);
    expect(completed.actualEndsAt).toBe(NOW);
    await expectApplicationError(() => service.startStudySession(core.context, completed.id), "education-invalid-state-transition");
    const goal = await service.createEducationGoal(core.context, { title: "Goal", goalType: "custom", status: "active" });
    expect(await service.completeEducationGoal(core.context, goal.id)).toMatchObject({ status: "completed", completedAt: NOW });
  });

  it("hard deletes schedules, grades, attendance, and certificates only after an owner-scoped lookup", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    const schedule = await service.createScheduleEntry(core.context, { title: "Entry", startsAt: NOW, endsAt: NOW, entryType: "other", status: "scheduled" });
    const certificate = await service.createCertificate(core.context, { name: "Cert", issuingOrganization: "Issuer", status: "planned" });
    await service.deleteScheduleEntry(core.context, schedule.id);
    await service.deleteCertificate(core.context, certificate.id);
    expect(await service.getScheduleEntry(core.context, schedule.id)).toBeNull();
    expect(await service.getCertificate(core.context, certificate.id)).toBeNull();
    await expectApplicationError(() => service.deleteCertificate(core.context, certificate.id), "education-record-not-found");
  });
});

describe("Education summaries and public entry point", () => {
  it("builds owner-scoped overview, deadlines, course progress, and study-time summaries", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    const topic = await service.createTopic(core.context, { courseId: core.course.id, title: "Done", sequence: 1, status: "planned" });
    await service.markTopicComplete(core.context, topic.id);
    await service.createTopic(core.context, { courseId: core.course.id, title: "Todo", sequence: 2, status: "planned" });
    const assignment = await service.createAssignment(core.context, { courseId: core.course.id, title: "Deadline", dueAt: "2026-10-01T08:00:00Z", priority: "normal", status: "assigned" });
    await service.createExam(core.context, { courseId: core.course.id, title: "Exam", examType: "final", scheduledStartsAt: "2026-10-02T08:00:00Z", scheduledEndsAt: "2026-10-02T10:00:00Z", status: "scheduled" });
    const session = await service.scheduleStudySession(core.context, { courseId: core.course.id, title: "Study", plannedStartsAt: "2026-09-03T08:00:00Z", actualDurationMinutes: 45, method: "review", status: "scheduled" });
    await service.startStudySession(core.context, session.id);
    await service.completeStudySession(core.context, session.id);
    await service.createAssignment({ ownerId: OWNER_B }, { courseId: (await createCore(service, OWNER_B)).course.id, title: "Private", dueAt: "2026-10-01T08:00:00Z", priority: "normal", status: "assigned" });

    expect(await service.getEducationOverview(core.context)).toMatchObject({ currentSemesterId: core.semester.id, activeCourseCount: 1, upcomingAssignmentCount: 1, upcomingExamCount: 1 });
    expect((await service.getUpcomingDeadlines(core.context, { startsAt: NOW, endsAt: "2026-12-31T23:59:59Z" })).map((item) => item.title)).toEqual(["Deadline", "Exam"]);
    expect(await service.getCourseProgress(core.context, core.course.id)).toMatchObject({ topics: { completedCount: 1, totalCount: 2, exactPercentage: "50" }, assignments: { completedCount: 0, totalCount: 1, exactPercentage: "0" } });
    expect(await service.getStudyTimeSummary(core.context, { range: { startsOn: "2026-09-01", endsOn: "2026-09-30" }, courseId: core.course.id })).toMatchObject({ totalMinutes: 45, sessionCount: 1, omittedSessionCount: 0 });
    expect((await service.getUpcomingAssignments(core.context)).items.map((item) => item.id)).toEqual([assignment.id]);
  });

  it("reuses weighted-grade, GPA, and CGPA calculators for academic performance", async () => {
    const { service } = createHarness();
    const core = await createCore(service);
    await service.recordGrade(core.context, { courseId: core.course.id, semesterId: core.semester.id, sourceType: "manual", title: "Final result", scoreEarned: "80", maximumScore: "100", weightPercentage: "100", gradePoints: "3.5", recordedAt: NOW });
    const summary = await service.getAcademicPerformanceSummary(core.context, { semesterId: core.semester.id, gradePointScale: "4" });
    expect(summary.courseGrades[0]?.weightedGrade?.exactCurrentGrade).toBe("80");
    expect(summary.semesterGpa?.exactGpa).toBe("3.5");
    expect(summary.cumulativeGpa?.exactCgpa).toBe("3.5");
  });

  it("reports no active semester and rejects inconsistent multiple-active state", async () => {
    const { service, repositories } = createHarness();
    expect(await service.getCurrentSemesterSummary({ ownerId: OWNER_A })).toBeNull();
    const core = await createCore(service);
    repositories.semesters.records.push({ ...core.semester, id: "99999999-9999-4999-8999-999999999999" });
    await expectApplicationError(() => service.getCurrentSemesterSummary(core.context), "education-conflict");
  });
});
