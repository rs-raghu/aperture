import {
  allFinanceCalculatorPlugins,
  createFinanceApplicationService,
  type FinanceApplicationService,
  type FinanceOperationContext,
} from "@aperture/finance";
import { createFinanceMemoryRepository } from "@aperture/finance-memory";

export const FINANCE_DEVELOPMENT_OWNER_ID = "finance-preview-owner";

export interface FinanceWebRuntime {
  readonly service: FinanceApplicationService;
  readonly context: FinanceOperationContext;
}

export function createFinanceWebRuntime(ownerId = FINANCE_DEVELOPMENT_OWNER_ID): FinanceWebRuntime {
  const repositories = createFinanceMemoryRepository();
  let sequence = 0;
  return Object.freeze({
    service: createFinanceApplicationService({
      repositories,
      calculatorRegistry: allFinanceCalculatorPlugins,
      clock: { now: () => new Date().toISOString() },
      idGenerator: { next: (scope) => `${scope.replaceAll(" ", "-")}-${crypto.randomUUID()}-${++sequence}` },
    }),
    context: Object.freeze({ ownerId }),
  });
}
