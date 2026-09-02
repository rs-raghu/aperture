import type { CrudRepository } from "../repositories/repository.types.js";
import type { LaboratoryResultListQuery, RecordLaboratoryResultInput, UpdateLaboratoryResultInput } from "./laboratory-result.contracts.js";
import type { LaboratoryResult, LaboratoryResultId } from "./laboratory-result.types.js";

export interface LaboratoryResultRepository
  extends CrudRepository<LaboratoryResult, LaboratoryResultId, RecordLaboratoryResultInput, UpdateLaboratoryResultInput, LaboratoryResultListQuery> {}
