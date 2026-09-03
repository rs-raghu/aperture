import type { EducationServiceDependencies } from "../application/dependencies.js";
import { createAcademicStructureUseCases } from "../application/use-cases/academic-structure.js";
import { createAssessmentUseCases } from "../application/use-cases/assessments.js";
import { createPlanningUseCases } from "../application/use-cases/planning.js";
import { createEducationSummaryUseCases } from "./summaries/education-summaries.js";
import type { EducationService } from "./education-service.types.js";

export function createEducationService(
  dependencies: EducationServiceDependencies,
): EducationService {
  return Object.freeze({
    ...createAcademicStructureUseCases(dependencies),
    ...createAssessmentUseCases(dependencies),
    ...createPlanningUseCases(dependencies),
    ...createEducationSummaryUseCases(dependencies),
  });
}
