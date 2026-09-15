import { createHealthService, type HealthClock } from "@aperture/health";
import { createHealthMemoryRepository } from "@aperture/health-memory";
import type { HealthMobileRuntime } from "../adapters/health-runtime";

export function createHealthTestRuntime(options?: { readonly ownerId?: string; readonly now?: string; readonly ids?: readonly string[] }): HealthMobileRuntime {
  const ownerId = options?.ownerId ?? "81000000-0000-4000-8000-000000000010";
  const now = options?.now ?? "2040-01-01T08:00:00Z";
  const ids = [...(options?.ids ?? [])];
  let next = 1;
  const clock: HealthClock = Object.freeze({ now: () => now });
  return Object.freeze({
    service: createHealthService({ repositories: createHealthMemoryRepository(), clock, idGenerator: Object.freeze({ generate: () => ids.shift() ?? `82000000-0000-4000-8000-${String(next++).padStart(12, "0")}` }) }),
    context: Object.freeze({ ownerId }),
    clock,
  });
}
