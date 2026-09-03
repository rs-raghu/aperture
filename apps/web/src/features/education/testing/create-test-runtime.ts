import { createEducationService, type EducationClock } from "@aperture/education";
import { createEducationMemoryRepository } from "@aperture/education-memory";
import type { EducationWebRuntime } from "../adapters/education-runtime";

export function createDeterministicEducationRuntime(ownerId: string): EducationWebRuntime {
  let idSequence = 1;
  let second = 0;
  const clock: EducationClock = { now: () => `2026-09-03T10:00:${String(second++).padStart(2, "0")}Z` };
  const idGenerator = { generate: () => `10000000-0000-4000-8000-${String(idSequence++).padStart(12, "0")}` };
  return Object.freeze({ service: createEducationService({ repositories: createEducationMemoryRepository(), clock, idGenerator }), context: Object.freeze({ ownerId }), clock });
}
