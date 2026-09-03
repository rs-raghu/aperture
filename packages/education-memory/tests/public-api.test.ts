import { describe, expect, it } from "vitest";

import { createEducationMemoryRepository } from "@aperture/education-memory";

const OWNER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

describe("public package entry", () => {
  it("creates an isolated aggregate through the documented public import", async () => {
    const first = createEducationMemoryRepository();
    const second = createEducationMemoryRepository();
    await first.institutions.create({
      id: "00000000-0000-4000-8000-000000000001",
      ownerId: OWNER_ID,
      name: "Synthetic Academy",
      type: "university",
      status: "active",
      createdAt: "2026-09-03T08:00:00Z",
      updatedAt: "2026-09-03T08:00:00Z",
    });
    expect((await first.institutions.findMany({ ownerId: OWNER_ID })).items).toHaveLength(1);
    expect((await second.institutions.findMany({ ownerId: OWNER_ID })).items).toHaveLength(0);
  });
});
