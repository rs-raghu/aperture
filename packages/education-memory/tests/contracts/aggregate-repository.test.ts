import { describe, expect, it } from "vitest";

import type { EducationRepository } from "@aperture/education";
import { createEducationMemoryRepository } from "../../src/index.js";
import { FIXTURE_IDS, OWNER_A, OWNER_B, buildInstitution } from "../fixtures/education-fixtures.js";

function acceptsEducationRepository(repository: EducationRepository): EducationRepository {
  return repository;
}

describe("Education memory aggregate", () => {
  it("exposes all fourteen repository interfaces and satisfies the aggregate type", () => {
    const repository = acceptsEducationRepository(createEducationMemoryRepository());
    expect(Object.keys(repository).sort()).toEqual([
      "assignments", "attendance", "certificates", "courses", "exams", "goals", "grades",
      "institutions", "programs", "resources", "schedules", "semesters", "studySessions", "topics",
    ]);
  });

  it("is frozen so repository properties cannot be replaced", () => {
    const repository = createEducationMemoryRepository();
    expect(Object.isFrozen(repository)).toBe(true);
    expect(Object.values(repository).every((value) => Object.isFrozen(value))).toBe(true);
    expect(() => Object.assign(repository, { institutions: undefined })).toThrow();
  });

  it("starts empty and adds no implicit seed records", async () => {
    const repository = createEducationMemoryRepository();
    const pages = await Promise.all([
      repository.institutions.findMany({ ownerId: OWNER_A }),
      repository.programs.findMany({ ownerId: OWNER_A }),
      repository.semesters.findMany({ ownerId: OWNER_A }),
      repository.courses.findMany({ ownerId: OWNER_A }),
      repository.assignments.findMany({ ownerId: OWNER_A }),
    ]);
    expect(pages.every((page) => page.items.length === 0)).toBe(true);
  });

  it("enforces globally unique IDs without exposing the existing owner", async () => {
    const repository = createEducationMemoryRepository().institutions;
    await repository.create(buildInstitution());
    await expect(repository.create(buildInstitution({ ownerId: OWNER_B }))).rejects.toMatchObject({
      code: "education-memory-duplicate-id",
      entityId: FIXTURE_IDS.institution,
    });
  });
});
