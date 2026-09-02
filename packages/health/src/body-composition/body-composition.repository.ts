import type { CrudRepository } from "../repositories/repository.types.js";
import type { BodyCompositionListQuery, RecordBodyCompositionInput, UpdateBodyCompositionInput } from "./body-composition.contracts.js";
import type { BodyCompositionRecord, BodyCompositionRecordId } from "./body-composition.types.js";

export interface BodyCompositionRepository
  extends CrudRepository<BodyCompositionRecord, BodyCompositionRecordId, RecordBodyCompositionInput, UpdateBodyCompositionInput, BodyCompositionListQuery> {}
