import { allFinanceCalculatorPlugins, createFinanceApplicationService } from "@aperture/finance";
import { createFinanceMemoryRepository } from "@aperture/finance-memory";
import type { FinanceWebRuntime } from "../adapters/finance-runtime";

export function createDeterministicFinanceRuntime(ownerId: string): FinanceWebRuntime {
  let sequence = 0;
  const now = "2040-01-01T08:00:00Z";
  return Object.freeze({
    service: createFinanceApplicationService({
      repositories: createFinanceMemoryRepository({ now: () => now }),
      calculatorRegistry: allFinanceCalculatorPlugins,
      clock: { now: () => now },
      idGenerator: { next: (scope) => `${scope.replaceAll(" ", "-")}-${++sequence}` },
    }),
    context: Object.freeze({ ownerId }),
  });
}
