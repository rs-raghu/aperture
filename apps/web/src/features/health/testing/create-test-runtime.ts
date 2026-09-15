import { createHealthService } from "@aperture/health";
import { createHealthMemoryRepository } from "@aperture/health-memory";
import type { HealthWebRuntime } from "../adapters/health-runtime";

export function createDeterministicHealthRuntime(ownerId: string): HealthWebRuntime {
  let sequence = 0;
  const clock = { now: () => "2040-01-01T08:00:00Z" } as const;
  return {
    service: createHealthService({
      repositories: createHealthMemoryRepository(),
      clock,
      idGenerator: { generate: () => `web-health-${String(++sequence).padStart(3, "0")}` },
    }),
    context: { ownerId },
    clock,
  };
}
