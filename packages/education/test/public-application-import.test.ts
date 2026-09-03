import { describe, expect, it } from "vitest";

import { createEducationService } from "@aperture/education";
import type { EducationRepository, Institution } from "@aperture/education";

describe("public application package entry", () => {
  it("creates a workflow service and executes a representative summary without private imports", async () => {
    const institutions: Institution[] = [];
    const emptyReader = { findMany: async () => ({ items: [] as readonly never[] }) };
    const repositories = {
      institutions: {
        findById: async (id: string, ownerId: string) => institutions.find((item) => item.id === id && item.ownerId === ownerId) ?? null,
        findMany: async () => ({ items: institutions }),
        create: async (entity: Institution) => { institutions.push(entity); return entity; },
        update: async (entity: Institution) => entity,
        delete: async () => undefined,
      },
      semesters: emptyReader,
      courses: emptyReader,
      assignments: emptyReader,
      exams: emptyReader,
    } as unknown as EducationRepository;
    const service = createEducationService({
      repositories,
      clock: { now: () => "2026-09-03T08:00:00Z" },
      idGenerator: { generate: () => "10000000-0000-4000-8000-000000000001" },
    });

    const institution = await service.createInstitution(
      { ownerId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" },
      { name: "Synthetic University", type: "university", status: "active" },
    );
    expect(institution.id).toBe("10000000-0000-4000-8000-000000000001");
    await expect(service.getEducationOverview({ ownerId: institution.ownerId })).resolves.toMatchObject({
      activeCourseCount: 0,
      upcomingAssignmentCount: 0,
      upcomingExamCount: 0,
    });
  });
});
