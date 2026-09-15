import {
  createHealthService,
  type HealthApplicationService,
  type HealthClock,
  type HealthOperationContext,
} from "@aperture/health";
import { createHealthMemoryRepository } from "@aperture/health-memory";

export const HEALTH_DEVELOPMENT_OWNER_ID = "health-preview-owner";

export interface HealthWebRuntime {
  readonly service: HealthApplicationService;
  readonly context: HealthOperationContext;
  readonly clock: HealthClock;
}

export function createHealthWebRuntime(ownerId = HEALTH_DEVELOPMENT_OWNER_ID): HealthWebRuntime {
  const repositories = createHealthMemoryRepository();
  const clock: HealthClock = { now: () => new Date().toISOString() };
  const idGenerator = { generate: () => crypto.randomUUID() };

  return Object.freeze({
    service: createHealthService({ repositories, clock, idGenerator }),
    context: Object.freeze({ ownerId }),
    clock,
  });
}
