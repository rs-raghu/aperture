import { createEducationService, type EducationClock } from "@aperture/education";
import { createEducationMemoryRepository } from "@aperture/education-memory";
import type { EducationMobileRuntime } from "../adapters/education-runtime";

export function createEducationTestRuntime(options?: {
  readonly ownerId?: string;
  readonly now?: string;
  readonly ids?: readonly string[];
}): EducationMobileRuntime {
  const ownerId = options?.ownerId ?? "10000000-0000-4000-8000-000000000010";
  const now = options?.now ?? "2026-09-03T12:00:00Z";
  const ids = [...(options?.ids ?? [])];
  let next = 1;
  const clock: EducationClock = Object.freeze({ now: () => now });
  const idGenerator = Object.freeze({
    generate: () => ids.shift() ?? `20000000-0000-4000-8000-${String(next++).padStart(12, "0")}`,
  });
  const repositories = createEducationMemoryRepository();
  return Object.freeze({
    service: createEducationService({ repositories, clock, idGenerator }),
    context: Object.freeze({ ownerId }),
    clock,
  });
}
