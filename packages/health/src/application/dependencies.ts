import type { IsoDateTimeString } from "../health.types.js";
import type { HealthRepository } from "../repositories/health-repository.contract.js";

export interface HealthClock {
  now(): IsoDateTimeString;
}

export interface HealthIdGenerator {
  generate(): string;
}

export interface HealthServiceDependencies {
  readonly repositories: HealthRepository;
  readonly clock: HealthClock;
  readonly idGenerator: HealthIdGenerator;
}
