import { allFinanceCalculatorPlugins, createFinanceApplicationService, type FinanceApplicationService, type FinanceOperationContext } from "@aperture/finance";
import { createFinanceMemoryRepository } from "@aperture/finance-memory";
import { randomUUID } from "expo-crypto";

export const FINANCE_DEVELOPMENT_MOBILE_OWNER_ID = "90000000-0000-4000-8000-000000000010";

export interface FinanceMobileRuntime {
  readonly service: FinanceApplicationService;
  readonly context: FinanceOperationContext;
}

export function createFinanceMobileRuntime(ownerId = FINANCE_DEVELOPMENT_MOBILE_OWNER_ID): FinanceMobileRuntime {
  return Object.freeze({
    service: createFinanceApplicationService({
      repositories: createFinanceMemoryRepository(),
      calculatorRegistry: allFinanceCalculatorPlugins,
      clock: Object.freeze({ now: () => new Date().toISOString() }),
      idGenerator: Object.freeze({ next: (scope: string) => `${scope.replaceAll(" ", "-")}-${randomUUID()}` }),
    }),
    context: Object.freeze({ ownerId }),
  });
}
