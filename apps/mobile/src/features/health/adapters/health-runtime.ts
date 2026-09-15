import { createHealthService, type HealthApplicationService, type HealthClock, type HealthOperationContext } from "@aperture/health";
import { createHealthMemoryRepository } from "@aperture/health-memory";
import { randomUUID } from "expo-crypto";

export const HEALTH_DEVELOPMENT_MOBILE_OWNER_ID = "80000000-0000-4000-8000-000000000010";

export interface HealthMobileRuntime {
  readonly service: HealthApplicationService;
  readonly context: HealthOperationContext;
  readonly clock: HealthClock;
}

export function createHealthMobileRuntime(ownerId = HEALTH_DEVELOPMENT_MOBILE_OWNER_ID): HealthMobileRuntime {
  const clock: HealthClock = Object.freeze({ now: () => new Date().toISOString() });
  return Object.freeze({
    service: createHealthService({
      repositories: createHealthMemoryRepository(),
      clock,
      idGenerator: Object.freeze({ generate: () => randomUUID() }),
    }),
    context: Object.freeze({ ownerId }),
    clock,
  });
}
