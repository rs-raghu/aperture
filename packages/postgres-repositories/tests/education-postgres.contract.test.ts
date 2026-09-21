import { afterEach, describe, expect, it } from "vitest";

import { createEducationPostgresRepository, PostgresRepositoryError } from "../src/index.js";
import { CREATED_AT, createTestDatabase, identifier, OWNER_A, OWNER_B, UPDATED_AT } from "./postgres-test-support.js";

interface RuntimeEntity extends Readonly<Record<string, unknown>> {
  readonly id: string;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface RuntimeRepository {
  create(entity: RuntimeEntity): Promise<RuntimeEntity>;
  update(entity: RuntimeEntity): Promise<RuntimeEntity>;
  delete(id: string, ownerId: string): Promise<void>;
  findById(id: string, ownerId: string): Promise<RuntimeEntity | null>;
  findMany(query: Readonly<Record<string, unknown>>): Promise<{ readonly items: readonly RuntimeEntity[]; readonly nextCursor?: string }>;
}

const metadata = { ownerId: OWNER_A, createdAt: CREATED_AT, updatedAt: UPDATED_AT } as const;
const ids = {
  institution: identifier(101), program: identifier(102), semester: identifier(103), course: identifier(104),
  topic: identifier(105), assignment: identifier(106), exam: identifier(107), grade: identifier(108),
  attendance: identifier(109), studySession: identifier(110), schedule: identifier(111), resource: identifier(112),
  certificate: identifier(113), goal: identifier(114),
} as const;

const fixtures: ReadonlyArray<readonly [string, RuntimeEntity, Readonly<Record<string, unknown>>]> = [
  ["institutions", { ...metadata, id: ids.institution, name: "Synthetic Academy", type: "university", status: "active" }, { ownerId: OWNER_A }],
  ["programs", { ...metadata, id: ids.program, institutionId: ids.institution, name: "Synthetic Program", programType: "degree", startsOn: "2040-01-01", requiredCredits: "120.00", status: "active" }, { ownerId: OWNER_A }],
  ["semesters", { ...metadata, id: ids.semester, programId: ids.program, name: "Semester One", academicYear: "2040", sequence: 1, startsOn: "2040-01-01", endsOn: "2040-06-30", status: "active" }, { ownerId: OWNER_A }],
  ["courses", { ...metadata, id: ids.course, semesterId: ids.semester, code: "SYN-101", name: "Synthetic Course", credits: "3.00", deliveryMode: "online", status: "active" }, { ownerId: OWNER_A }],
  ["topics", { ...metadata, id: ids.topic, courseId: ids.course, title: "Synthetic Topic", sequence: 1, status: "planned" }, { ownerId: OWNER_A, courseId: ids.course }],
  ["assignments", { ...metadata, id: ids.assignment, courseId: ids.course, title: "Synthetic Assignment", dueAt: "2040-02-01T08:00:00.000Z", maximumScore: "100.00", weightPercentage: "40.00", priority: "normal", status: "assigned" }, { ownerId: OWNER_A }],
  ["exams", { ...metadata, id: ids.exam, courseId: ids.course, semesterId: ids.semester, title: "Synthetic Exam", examType: "final", scheduledStartsAt: "2040-03-01T08:00:00.000Z", scheduledEndsAt: "2040-03-01T10:00:00.000Z", status: "scheduled" }, { ownerId: OWNER_A }],
  ["grades", { ...metadata, id: ids.grade, courseId: ids.course, semesterId: ids.semester, assignmentId: ids.assignment, sourceType: "assignment", title: "Synthetic Grade", scoreEarned: "87.50", maximumScore: "100.00", gradePoints: "3.75", weightPercentage: "40.00", recordedAt: CREATED_AT }, { ownerId: OWNER_A }],
  ["attendance", { ...metadata, id: ids.attendance, courseId: ids.course, sessionDate: "2040-01-03", status: "present", source: "manual" }, { ownerId: OWNER_A }],
  ["studySessions", { ...metadata, id: ids.studySession, courseId: ids.course, topicId: ids.topic, title: "Synthetic Study Session", plannedStartsAt: "2040-01-04T08:00:00.000Z", plannedEndsAt: "2040-01-04T09:00:00.000Z", plannedDurationMinutes: 60, method: "review", status: "scheduled" }, { ownerId: OWNER_A }],
  ["schedules", { ...metadata, id: ids.schedule, courseId: ids.course, title: "Synthetic Schedule", startsAt: "2040-01-05T08:00:00.000Z", endsAt: "2040-01-05T09:00:00.000Z", entryType: "class", recurrence: { rule: "FREQ=WEEKLY", timeZone: "UTC" }, status: "scheduled" }, { ownerId: OWNER_A }],
  ["resources", { ...metadata, id: ids.resource, courseId: ids.course, topicId: ids.topic, title: "Synthetic Handbook", type: "book", status: "active" }, { ownerId: OWNER_A, courseId: ids.course }],
  ["certificates", { ...metadata, id: ids.certificate, courseId: ids.course, name: "Synthetic Certificate", issuingOrganization: "Synthetic Issuer", issuedOn: "2040-06-30", status: "earned" }, { ownerId: OWNER_A }],
  ["goals", { ...metadata, id: ids.goal, courseId: ids.course, title: "Synthetic Goal", goalType: "completion", targetValue: "1.00", targetUnit: "course", status: "active" }, { ownerId: OWNER_A }],
];

const databases: Array<Awaited<ReturnType<typeof createTestDatabase>>["database"]> = [];
afterEach(async () => Promise.all(databases.splice(0).map((database) => database.close())));

describe("Education PostgreSQL repository contract", () => {
  it("persists every aggregate contract with owner-scoped CRUD and defensive copies", async () => {
    const testDatabase = await createTestDatabase();
    databases.push(testDatabase.database);
    const aggregate = createEducationPostgresRepository(testDatabase.executor) as unknown as Readonly<Record<string, RuntimeRepository>>;

    for (const [key, entity, query] of fixtures) {
      const repository = aggregate[key]!;
      const created = await repository.create(structuredClone(entity));
      expect(created).toEqual(entity);
      expect(await repository.findById(entity.id, OWNER_A)).toEqual(entity);
      expect(await repository.findById(entity.id, OWNER_B)).toBeNull();
      expect((await repository.findMany(query)).items).toContainEqual(entity);
      const updated = { ...entity, updatedAt: "2040-01-01T10:00:00.000Z" };
      expect(await repository.update(updated)).toEqual(updated);
      const mutableRead = await repository.findById(entity.id, OWNER_A);
      (mutableRead as { updatedAt: string }).updatedAt = CREATED_AT;
      expect((await repository.findById(entity.id, OWNER_A))?.updatedAt).toBe(updated.updatedAt);
    }

    const secondAggregate = createEducationPostgresRepository(testDatabase.executor) as unknown as Readonly<Record<string, RuntimeRepository>>;
    expect(await secondAggregate.institutions!.findById(ids.institution, OWNER_A)).not.toBeNull();
    await aggregate.goals!.delete(ids.goal, OWNER_A);
    expect(await aggregate.goals!.findById(ids.goal, OWNER_A)).toBeNull();
  });

  it("preserves specialized lookups, deterministic pagination, and stale-cursor rejection", async () => {
    const testDatabase = await createTestDatabase();
    databases.push(testDatabase.database);
    const repository = createEducationPostgresRepository(testDatabase.executor);
    const institution = fixtures[0]![1];
    await (repository.institutions as unknown as RuntimeRepository).create(institution);
    await repository.institutions.create({ ...institution, id: identifier(120), name: "Another Academy" } as never);
    const first = await repository.institutions.findMany({ ownerId: OWNER_A, limit: 1 });
    expect(first.items).toHaveLength(1);
    expect(first.nextCursor).toBeTypeOf("string");
    const second = await repository.institutions.findMany({ ownerId: OWNER_A, limit: 1, cursor: first.nextCursor });
    expect(new Set([...first.items, ...second.items].map((item) => item.id)).size).toBe(2);

    await repository.institutions.create({ ...institution, id: identifier(121), name: "Third Academy" } as never);
    await expect(repository.institutions.findMany({ ownerId: OWNER_A, limit: 1, cursor: first.nextCursor })).rejects.toMatchObject({ code: "postgres-invalid-query" });

    for (const [key, entity] of fixtures.slice(1, 5)) {
      await (repository as unknown as Readonly<Record<string, RuntimeRepository>>)[key]!.create(entity);
    }
    expect(await repository.courses.findByCode(OWNER_A, ids.semester, "SYN-101")).toMatchObject({ id: ids.course });
  });

  it("returns structured constraint errors", async () => {
    const testDatabase = await createTestDatabase();
    databases.push(testDatabase.database);
    const repository = createEducationPostgresRepository(testDatabase.executor);
    const institution = fixtures[0]![1];
    await (repository.institutions as unknown as RuntimeRepository).create(institution);
    await expect((repository.institutions as unknown as RuntimeRepository).create(institution)).rejects.toBeInstanceOf(PostgresRepositoryError);
    await expect((repository.institutions as unknown as RuntimeRepository).create(institution)).rejects.toMatchObject({ code: "postgres-duplicate-record" });
  });
});
