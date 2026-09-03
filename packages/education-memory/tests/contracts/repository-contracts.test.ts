import { describe, expect, it } from "vitest";

import type { EducationRepository, OwnerId, PageResult } from "@aperture/education";
import {
  EducationMemoryRepositoryError,
  createEducationMemoryRepository,
} from "../../src/index.js";
import {
  CREATED_AT,
  FIXTURE_IDS,
  OWNER_A,
  OWNER_B,
  UPDATED_AT,
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

interface ContractEntity {
  readonly id: string;
  readonly ownerId: OwnerId;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface ContractQuery {
  readonly ownerId: OwnerId;
  readonly cursor?: string | undefined;
  readonly limit?: number | undefined;
  readonly sortDirection?: "ascending" | "descending" | undefined;
  readonly [key: string]: unknown;
}

interface ContractRepository {
  create(entity: ContractEntity): Promise<ContractEntity>;
  update(entity: ContractEntity): Promise<ContractEntity>;
  delete(id: string, ownerId: OwnerId): Promise<void>;
  findById(id: string, ownerId: OwnerId): Promise<ContractEntity | null>;
  findMany(query: ContractQuery): Promise<PageResult<ContractEntity>>;
}

interface RepositoryCase {
  readonly name: string;
  readonly select: (repository: EducationRepository) => ContractRepository;
  readonly build: (overrides?: Partial<ContractEntity>) => ContractEntity;
  readonly query: ContractQuery;
}

function repositoryCase<TEntity extends ContractEntity>(
  name: string,
  select: (repository: EducationRepository) => object,
  build: (overrides?: Partial<TEntity>) => TEntity,
  query: ContractQuery = { ownerId: OWNER_A },
): RepositoryCase {
  return {
    name,
    select: (repository) => select(repository) as ContractRepository,
    build: (overrides = {}) => build(overrides as Partial<TEntity>),
    query,
  };
}

const cases: readonly RepositoryCase[] = [
  repositoryCase("institutions", (repository) => repository.institutions, buildInstitution),
  repositoryCase("programs", (repository) => repository.programs, buildProgram),
  repositoryCase("semesters", (repository) => repository.semesters, buildSemester),
  repositoryCase("courses", (repository) => repository.courses, buildCourse),
  repositoryCase("topics", (repository) => repository.topics, buildTopic, { ownerId: OWNER_A, courseId: FIXTURE_IDS.course }),
  repositoryCase("assignments", (repository) => repository.assignments, buildAssignment),
  repositoryCase("exams", (repository) => repository.exams, buildExam),
  repositoryCase("grades", (repository) => repository.grades, buildGrade),
  repositoryCase("attendance", (repository) => repository.attendance, buildAttendance),
  repositoryCase("study sessions", (repository) => repository.studySessions, buildStudySession),
  repositoryCase("schedules", (repository) => repository.schedules, buildScheduleEntry),
  repositoryCase("resources", (repository) => repository.resources, buildResource, { ownerId: OWNER_A, courseId: FIXTURE_IDS.course }),
  repositoryCase("certificates", (repository) => repository.certificates, buildCertificate),
  repositoryCase("education goals", (repository) => repository.goals, buildEducationGoal),
];

async function expectMemoryError(
  action: () => Promise<unknown>,
  code: EducationMemoryRepositoryError["code"],
): Promise<void> {
  try {
    await action();
    throw new Error("Expected memory repository error.");
  } catch (error) {
    expect(error).toBeInstanceOf(EducationMemoryRepositoryError);
    expect((error as EducationMemoryRepositoryError).code).toBe(code);
    expect((error as Error).message).not.toContain("[object Object]");
  }
}

describe.each(cases)("$name repository contract", (contract) => {
  it("creates and returns every supplied field", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    const entity = contract.build();
    await expect(repository.create(entity)).resolves.toEqual(entity);
  });

  it("rejects duplicate IDs", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    const entity = contract.build();
    await repository.create(entity);
    await expectMemoryError(() => repository.create(entity), "education-memory-duplicate-id");
  });

  it("finds an existing ID", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    const entity = contract.build();
    await repository.create(entity);
    await expect(repository.findById(entity.id, OWNER_A)).resolves.toEqual(entity);
  });

  it("returns null for a missing ID", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    await expect(repository.findById(FIXTURE_IDS.alternate, OWNER_A)).resolves.toBeNull();
  });

  it("hides an existing record from the wrong owner", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    const entity = contract.build();
    await repository.create(entity);
    await expect(repository.findById(entity.id, OWNER_B)).resolves.toBeNull();
  });

  it("lists only the requested owner", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    await repository.create(contract.build());
    await repository.create(contract.build({ id: FIXTURE_IDS.alternate, ownerId: OWNER_B }));
    const page = await repository.findMany(contract.query);
    expect(page.items).toHaveLength(1);
    expect(page.items[0]?.ownerId).toBe(OWNER_A);
  });

  it("updates an existing owner-scoped record", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    const entity = contract.build();
    await repository.create(entity);
    const updated = { ...entity, updatedAt: "2026-09-03T10:00:00Z" };
    await expect(repository.update(updated)).resolves.toEqual(updated);
    await expect(repository.findById(entity.id, OWNER_A)).resolves.toEqual(updated);
  });

  it("rejects a missing update", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    await expectMemoryError(
      () => repository.update(contract.build({ id: FIXTURE_IDS.alternate })),
      "education-memory-record-not-found",
    );
  });

  it("rejects owner reassignment without revealing another owner", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    const entity = contract.build();
    await repository.create(entity);
    await expectMemoryError(
      () => repository.update({ ...entity, ownerId: OWNER_B }),
      "education-memory-record-not-found",
    );
    await expect(repository.findById(entity.id, OWNER_A)).resolves.toEqual(entity);
  });

  it("rejects creation-timestamp changes", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    const entity = contract.build();
    await repository.create(entity);
    await expectMemoryError(
      () => repository.update({ ...entity, createdAt: "2026-09-02T08:00:00Z" }),
      "education-memory-immutable-identity",
    );
  });

  it("deletes only the requested owner record", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    const entity = contract.build();
    await repository.create(entity);
    await expect(repository.delete(entity.id, OWNER_A)).resolves.toBeUndefined();
    await expect(repository.findById(entity.id, OWNER_A)).resolves.toBeNull();
  });

  it("rejects missing and wrong-owner deletes identically", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    const entity = contract.build();
    await repository.create(entity);
    await expectMemoryError(
      () => repository.delete(entity.id, OWNER_B),
      "education-memory-record-not-found",
    );
    await expectMemoryError(
      () => repository.delete(FIXTURE_IDS.alternate, OWNER_A),
      "education-memory-record-not-found",
    );
  });

  it("defensively copies values during create", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    const entity = contract.build();
    const created = await repository.create(entity);
    (entity as { updatedAt: string }).updatedAt = CREATED_AT;
    (created as { updatedAt: string }).updatedAt = CREATED_AT;
    expect((await repository.findById(entity.id, OWNER_A))?.updatedAt).toBe(UPDATED_AT);
  });

  it("defensively copies values returned by findById and findMany", async () => {
    const repository = contract.select(createEducationMemoryRepository());
    const entity = contract.build();
    await repository.create(entity);
    const found = await repository.findById(entity.id, OWNER_A);
    (found as { updatedAt: string }).updatedAt = CREATED_AT;
    const page = await repository.findMany(contract.query);
    (page.items[0] as { updatedAt: string }).updatedAt = CREATED_AT;
    expect((await repository.findById(entity.id, OWNER_A))?.updatedAt).toBe(UPDATED_AT);
  });

  it("does not share records between aggregate factory instances", async () => {
    const first = contract.select(createEducationMemoryRepository());
    const second = contract.select(createEducationMemoryRepository());
    const entity = contract.build();
    await first.create(entity);
    await expect(second.findById(entity.id, OWNER_A)).resolves.toBeNull();
  });
});

describe("nested defensive copies", () => {
  it("protects nested schedule recurrence values", async () => {
    const repository = createEducationMemoryRepository().schedules;
    const entity = buildScheduleEntry();
    await repository.create(entity);
    (entity.recurrence as { rule: string }).rule = "CHANGED";
    const firstRead = await repository.findById(entity.id, OWNER_A);
    expect(firstRead?.recurrence?.rule).toBe("FREQ=WEEKLY");
    (firstRead?.recurrence as { rule: string }).rule = "CHANGED-AGAIN";
    expect((await repository.findById(entity.id, OWNER_A))?.recurrence?.rule).toBe("FREQ=WEEKLY");
  });
});
