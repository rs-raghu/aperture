import { describe, expect, expectTypeOf, it } from "vitest";

import type { FinanceRepository } from "@aperture/finance";
import * as memory from "../src/index.js";

describe("Finance memory public API", () => {
  it("exports the intended runtime surface", () => {
    expect(Object.keys(memory).sort()).toEqual(["FinanceMemoryRepositoryError", "createFinanceMemoryRepository"]);
  });

  it("satisfies the aggregate Finance repository contract", () => {
    const repository = memory.createFinanceMemoryRepository();
    expectTypeOf(repository).toMatchTypeOf<FinanceRepository>();
    expect(Object.keys(repository)).toHaveLength(26);
  });
});
