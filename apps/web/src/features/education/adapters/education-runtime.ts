import { createEducationService, type EducationClock, type EducationOperationContext, type EducationService } from "@aperture/education";
import { createEducationMemoryRepository } from "@aperture/education-memory";

export const DEVELOPMENT_OWNER_ID = "90000000-0000-4000-8000-000000000009";

export interface EducationWebRuntime {
  readonly service: EducationService;
  readonly context: EducationOperationContext;
  readonly clock: EducationClock;
}

export function createEducationWebRuntime(ownerId = DEVELOPMENT_OWNER_ID): EducationWebRuntime {
  const repositories = createEducationMemoryRepository();
  const clock: EducationClock = { now: () => new Date().toISOString() };
  const idGenerator = { generate: () => crypto.randomUUID() };

  return Object.freeze({
    service: createEducationService({ repositories, clock, idGenerator }),
    context: Object.freeze({ ownerId }),
    clock,
  });
}
