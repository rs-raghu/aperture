import { allFinanceCalculatorPlugins, createFinanceApplicationService } from "@aperture/finance";
import { createFinanceMemoryRepository } from "@aperture/finance-memory";
import type { FinanceMobileRuntime } from "../adapters/finance-runtime";

export function createFinanceTestRuntime(options?: { readonly ownerId?: string; readonly now?: string; readonly ids?: readonly string[] }): FinanceMobileRuntime {
  const ownerId = options?.ownerId ?? "91000000-0000-4000-8000-000000000010";
  const now = options?.now ?? "2040-01-01T08:00:00Z";
  const ids = [...(options?.ids ?? [])]; let sequence = 0;
  return Object.freeze({
    service: createFinanceApplicationService({
      repositories: createFinanceMemoryRepository({ now: () => now }),
      calculatorRegistry: allFinanceCalculatorPlugins,
      clock: Object.freeze({ now: () => now }),
      idGenerator: Object.freeze({ next: (scope: string) => ids.shift() ?? `${scope.replaceAll(" ", "-")}-${++sequence}` }),
    }),
    context: Object.freeze({ ownerId }),
  });
}
