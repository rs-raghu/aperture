import { describe, expect, expectTypeOf, it } from "vitest";

import * as memory from "@aperture/health-memory";
import type { HealthRepository } from "@aperture/health";

describe("Health memory public API", () => {
  it("exports the exact runtime surface through the built package", () => {
    expect(Object.keys(memory).sort()).toEqual([
      "HealthMemoryRepositoryError",
      "createHealthMemoryRepository",
      "healthMemoryRepositoryErrorCodes",
    ]);
  });

  it("satisfies the aggregate Health repository contract", () => {
    const repository = memory.createHealthMemoryRepository();
    expectTypeOf(repository).toMatchTypeOf<HealthRepository>();
    expect(repository.measurements.findMany).toBeTypeOf("function");
    expect(repository.equipment.recordUsage).toBeTypeOf("function");
    expect(repository.profiles.findByOwner).toBeTypeOf("function");
  });

  it("exposes structured adapter error codes", async () => {
    const repository = memory.createHealthMemoryRepository().appointments;
    await expect(repository.delete("missing", "synthetic-owner")).rejects.toMatchObject({
      name: "HealthMemoryRepositoryError",
      code: "health-memory-record-not-found",
      entityId: "missing",
    });
  });
});
