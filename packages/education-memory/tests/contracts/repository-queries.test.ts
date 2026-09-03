import { describe, expect, it } from "vitest";

import { createEducationMemoryRepository } from "../../src/index.js";
import {
  FIXTURE_IDS,
  OWNER_A,
  OWNER_B,
  buildAssignment,
  buildAttendance,
  buildCertificate,
  buildCourse,
  buildEducationGoal,
  buildExam,
  buildGrade,
  buildInstitution,
  buildProgram,
  buildResource,
  buildScheduleEntry,
  buildSemester,
  buildStudySession,
  buildTopic,
} from "../fixtures/education-fixtures.js";

function id(value: number): string {
  return `10000000-0000-4000-8000-${String(value).padStart(12, "0")}`;
}

describe("memory repository domain queries", () => {
  it("filters institutions, programs, semesters, and courses", async () => {
    const repository = createEducationMemoryRepository();
    await repository.institutions.create(buildInstitution({ shortName: "SA" }));
    await repository.institutions.create(buildInstitution({ id: id(1), name: "Archived College", type: "college", status: "archived" }));
    expect((await repository.institutions.findMany({ ownerId: OWNER_A, type: "university", status: "active", search: "academy" })).items.map((item) => item.id)).toEqual([FIXTURE_IDS.institution]);

    await repository.programs.create(buildProgram());
    await repository.programs.create(buildProgram({ id: id(2), institutionId: id(1), programType: "certificate", status: "archived" }));
    expect((await repository.programs.findMany({ ownerId: OWNER_A, institutionId: FIXTURE_IDS.institution, programType: "degree", status: "active" })).items).toHaveLength(1);

    await repository.semesters.create(buildSemester({ sequence: 2 }));
    await repository.semesters.create(buildSemester({ id: id(3), sequence: 1, academicYear: "2025", status: "completed" }));
    expect((await repository.semesters.findMany({ ownerId: OWNER_A, programId: FIXTURE_IDS.program })).items.map((item) => item.sequence)).toEqual([1, 2]);
    expect((await repository.semesters.findMany({ ownerId: OWNER_A, academicYear: "2025", status: "completed" })).items).toHaveLength(1);

    await repository.courses.create(buildCourse());
    await repository.courses.create(buildCourse({ id: id(4), code: "SYN-202", name: "Laboratory", deliveryMode: "in_person", status: "planned" }));
    expect((await repository.courses.findMany({ ownerId: OWNER_A, semesterId: FIXTURE_IDS.semester, deliveryMode: "online", status: "active", search: "syn-101" })).items).toHaveLength(1);
    expect((await repository.courses.findByCode(OWNER_A, FIXTURE_IDS.semester, "SYN-101"))?.id).toBe(FIXTURE_IDS.course);
    await expect(repository.courses.findByCode(OWNER_B, FIXTURE_IDS.semester, "SYN-101")).resolves.toBeNull();
  });

  it("filters and deterministically orders topics, assignments, and exams", async () => {
    const repository = createEducationMemoryRepository();
    await repository.topics.create(buildTopic({ sequence: 2 }));
    await repository.topics.create(buildTopic({ id: id(5), sequence: 1, status: "completed" }));
    expect((await repository.topics.findMany({ ownerId: OWNER_A, courseId: FIXTURE_IDS.course })).items.map((item) => item.sequence)).toEqual([1, 2]);
    expect((await repository.topics.findMany({ ownerId: OWNER_A, courseId: FIXTURE_IDS.course, status: "completed" })).items).toHaveLength(1);

    await repository.assignments.create(buildAssignment({ dueAt: "2026-10-02T08:00:00Z" }));
    await repository.assignments.create(buildAssignment({ id: id(6), dueAt: "2026-10-01T08:00:00Z", priority: "high", status: "completed" }));
    expect((await repository.assignments.findMany({ ownerId: OWNER_A, courseId: FIXTURE_IDS.course, dueFrom: "2026-10-01T08:00:00Z", dueTo: "2026-10-02T08:00:00Z" })).items.map((item) => item.id)).toEqual([id(6), FIXTURE_IDS.assignment]);
    expect((await repository.assignments.findMany({ ownerId: OWNER_A, priority: "high", status: "completed" })).items).toHaveLength(1);

    await repository.exams.create(buildExam({ scheduledStartsAt: "2026-11-02T08:00:00Z", scheduledEndsAt: "2026-11-02T10:00:00Z" }));
    await repository.exams.create(buildExam({ id: id(7), examType: "midterm", scheduledStartsAt: "2026-11-01T08:00:00Z", scheduledEndsAt: "2026-11-01T10:00:00Z", status: "completed" }));
    expect((await repository.exams.findMany({ ownerId: OWNER_A, startsAfter: "2026-11-01T08:00:00Z", startsBefore: "2026-11-02T08:00:00Z" })).items.map((item) => item.id)).toEqual([id(7), FIXTURE_IDS.exam]);
    expect((await repository.exams.findMany({ ownerId: OWNER_A, examType: "midterm", status: "completed" })).items).toHaveLength(1);
  });

  it("supports grade and attendance relationship identities", async () => {
    const repository = createEducationMemoryRepository();
    await repository.grades.create(buildGrade());
    await repository.grades.create(buildGrade({ id: id(8), assignmentId: undefined, examId: FIXTURE_IDS.exam, sourceType: "exam", recordedAt: "2026-09-04T08:00:00Z" }));
    expect((await repository.grades.findMany({ ownerId: OWNER_A, courseId: FIXTURE_IDS.course, sourceType: "assignment" })).items).toHaveLength(1);
    expect((await repository.grades.findManyBySemester({ ownerId: OWNER_A, semesterId: FIXTURE_IDS.semester })).items).toHaveLength(2);
    expect((await repository.grades.findForGradeable(OWNER_A, FIXTURE_IDS.course, FIXTURE_IDS.assignment))?.id).toBe(FIXTURE_IDS.grade);
    expect((await repository.grades.findForGradeable(OWNER_A, FIXTURE_IDS.course, undefined, FIXTURE_IDS.exam))?.id).toBe(id(8));

    await repository.attendance.create(buildAttendance());
    await repository.attendance.create(buildAttendance({ id: id(9), sessionDate: "2026-09-04", status: "absent", source: "imported" }));
    expect((await repository.attendance.findMany({ ownerId: OWNER_A, courseId: FIXTURE_IDS.course, source: "imported", status: "absent", dateFrom: "2026-09-04", dateTo: "2026-09-04" })).items).toHaveLength(1);
    expect((await repository.attendance.findByCourseAndSessionDate(OWNER_A, FIXTURE_IDS.course, "2026-09-03"))?.id).toBe(FIXTURE_IDS.attendance);
  });

  it("filters study sessions, schedule overlaps, resources, certificates, and goals", async () => {
    const repository = createEducationMemoryRepository();
    await repository.studySessions.create(buildStudySession());
    await repository.studySessions.create(buildStudySession({ id: id(10), topicId: undefined, plannedStartsAt: "2026-09-05T08:00:00Z", plannedEndsAt: "2026-09-05T09:00:00Z", method: "practice", status: "completed" }));
    expect((await repository.studySessions.findMany({ ownerId: OWNER_A, courseId: FIXTURE_IDS.course, topicId: FIXTURE_IDS.topic, method: "review", status: "scheduled", startsAfter: "2026-09-04T08:00:00Z", startsBefore: "2026-09-04T08:00:00Z" })).items).toHaveLength(1);

    await repository.schedules.create(buildScheduleEntry());
    await repository.schedules.create(buildScheduleEntry({ id: id(11), entryType: "exam", status: "completed", startsAt: "2026-10-01T08:00:00Z", endsAt: "2026-10-01T10:00:00Z" }));
    expect((await repository.schedules.findMany({ ownerId: OWNER_A, courseId: FIXTURE_IDS.course, startsBefore: "2026-09-05T08:30:00Z", endsAfter: "2026-09-05T08:30:00Z" })).items).toHaveLength(1);

    await repository.resources.create(buildResource());
    await repository.resources.create(buildResource({ id: id(12), topicId: undefined, type: "video", status: "completed" }));
    expect((await repository.resources.findMany({ ownerId: OWNER_A, courseId: FIXTURE_IDS.course, topicId: FIXTURE_IDS.topic, type: "book", status: "active" })).items).toHaveLength(1);

    await repository.certificates.create(buildCertificate());
    await repository.certificates.create(buildCertificate({ id: id(13), courseId: undefined, institutionId: FIXTURE_IDS.institution, issuingOrganization: "Other Issuer", status: "planned" }));
    expect((await repository.certificates.findMany({ ownerId: OWNER_A, courseId: FIXTURE_IDS.course, issuingOrganization: "Synthetic Issuer", status: "earned" })).items).toHaveLength(1);

    await repository.goals.create(buildEducationGoal());
    await repository.goals.create(buildEducationGoal({ id: id(14), courseId: undefined, programId: FIXTURE_IDS.program, goalType: "credits", status: "planned" }));
    expect((await repository.goals.findMany({ ownerId: OWNER_A, programId: FIXTURE_IDS.program, goalType: "credits", status: "planned" })).items).toHaveLength(1);
  });

  it("paginates a stable ordered result without duplicates or skips", async () => {
    const repository = createEducationMemoryRepository().institutions;
    await repository.create(buildInstitution({ id: id(20), name: "Charlie" }));
    await repository.create(buildInstitution({ id: id(21), name: "Alpha" }));
    await repository.create(buildInstitution({ id: id(22), name: "Bravo" }));
    const first = await repository.findMany({ ownerId: OWNER_A, limit: 2 });
    const second = await repository.findMany({ ownerId: OWNER_A, limit: 2, cursor: first.nextCursor });
    expect([...first.items, ...second.items].map((item) => item.name)).toEqual(["Alpha", "Bravo", "Charlie"]);
    expect(new Set([...first.items, ...second.items].map((item) => item.id)).size).toBe(3);
    expect(first.nextCursor).toBe("memory:2");
    expect(second.nextCursor).toBeUndefined();
  });

  it("uses ID as a stable tie-breaker and respects descending direction", async () => {
    const repository = createEducationMemoryRepository().institutions;
    await repository.create(buildInstitution({ id: id(31), name: "Same" }));
    await repository.create(buildInstitution({ id: id(30), name: "Same" }));
    expect((await repository.findMany({ ownerId: OWNER_A })).items.map((item) => item.id)).toEqual([id(30), id(31)]);
    expect((await repository.findMany({ ownerId: OWNER_A, sortDirection: "descending" })).items.map((item) => item.id)).toEqual([id(30), id(31)]);
  });

  it("rejects invalid limits and cursors", async () => {
    const repository = createEducationMemoryRepository().institutions;
    await expect(repository.findMany({ ownerId: OWNER_A, limit: 0 })).rejects.toMatchObject({ code: "education-memory-invalid-query" });
    await expect(repository.findMany({ ownerId: OWNER_A, cursor: "invalid" })).rejects.toMatchObject({ code: "education-memory-invalid-query" });
    await expect(repository.findMany({ ownerId: OWNER_A, cursor: "memory:1" })).rejects.toMatchObject({ code: "education-memory-invalid-query" });
  });
});
