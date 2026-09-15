import { expect } from "vitest";

import {
  HealthMemoryRepositoryError,
  createHealthMemoryRepository,
} from "../../src/index.js";
import {
  runHealthRepositoryContractSuite,
  type RepositoryContractErrorKind,
} from "./health-repository.contract-suite.js";

const errorCodes: Record<RepositoryContractErrorKind, HealthMemoryRepositoryError["code"]> = {
  "duplicate-id": "health-memory-duplicate-id",
  "record-not-found": "health-memory-record-not-found",
  "immutable-identity": "health-memory-immutable-identity",
  "invalid-query": "health-memory-invalid-query",
};

runHealthRepositoryContractSuite({
  name: "Health memory adapter",
  createRepository: createHealthMemoryRepository,
  async expectError(action, kind) {
    try {
      await action();
      throw new Error("Expected repository error.");
    } catch (error) {
      expect(error).toBeInstanceOf(HealthMemoryRepositoryError);
      expect((error as HealthMemoryRepositoryError).code).toBe(errorCodes[kind]);
      expect((error as Error).message).not.toContain("[object Object]");
    }
  },
});
