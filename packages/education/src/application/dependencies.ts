import type { EducationRepository } from "../repositories/education-repository.contract.js";
import type { EducationClock } from "./clock.contract.js";

export interface EducationIdGenerator {
  generate(): string;
}

export interface EducationServiceDependencies {
  readonly repositories: EducationRepository;
  readonly clock: EducationClock;
  readonly idGenerator: EducationIdGenerator;
}
