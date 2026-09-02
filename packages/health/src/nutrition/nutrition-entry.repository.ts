import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateNutritionEntryInput, NutritionEntryListQuery, UpdateNutritionEntryInput } from "./nutrition-entry.contracts.js";
import type { NutritionEntry, NutritionEntryId } from "./nutrition-entry.types.js";

export interface NutritionEntryRepository
  extends CrudRepository<NutritionEntry, NutritionEntryId, CreateNutritionEntryInput, UpdateNutritionEntryInput, NutritionEntryListQuery> {}
