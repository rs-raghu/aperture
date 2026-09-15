import type { CrudRepository } from "../repositories/repository.types.js";
import type { SymptomEntryListQuery } from "./symptom-entry.contracts.js";
import type { SymptomEntry, SymptomEntryId } from "./symptom-entry.types.js";

export interface SymptomEntryRepository
  extends CrudRepository<SymptomEntry, SymptomEntryId, SymptomEntryListQuery> {}
