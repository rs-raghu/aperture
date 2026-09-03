import {
  createEducationService,
  type EducationClock,
  type EducationOperationContext,
  type EducationService,
} from "@aperture/education";
import { createEducationMemoryRepository } from "@aperture/education-memory";
import { randomUUID } from "expo-crypto";

export const DEVELOPMENT_MOBILE_OWNER_ID = "90000000-0000-4000-8000-000000000010";

export interface EducationMobileRuntime {
  readonly service: EducationService;
  readonly context: EducationOperationContext;
  readonly clock: EducationClock;
}

export function createEducationMobileRuntime(
  ownerId = DEVELOPMENT_MOBILE_OWNER_ID,
): EducationMobileRuntime {
  const repositories = createEducationMemoryRepository();
  const clock: EducationClock = Object.freeze({ now: () => new Date().toISOString() });
  const idGenerator = Object.freeze({ generate: () => randomUUID() });

  return Object.freeze({
    service: createEducationService({ repositories, clock, idGenerator }),
    context: Object.freeze({ ownerId }),
    clock,
  });
}
