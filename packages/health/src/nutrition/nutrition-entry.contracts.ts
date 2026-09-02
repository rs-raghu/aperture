import type { IsoDateString, IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { EnergyValue, NutritionMassValue } from "../health-units.types.js";
import type { MealType, NutritionEntry, NutritionEntryId } from "./nutrition-entry.types.js";

export interface CreateNutritionEntryInput {
  readonly ownerId: OwnerId;
  readonly title: string;
  readonly mealType: MealType;
  readonly consumedAt: IsoDateTimeString;
  readonly energy?: EnergyValue;
  readonly protein?: NutritionMassValue;
  readonly carbohydrate?: NutritionMassValue;
  readonly fat?: NutritionMassValue;
}
export type UpdateNutritionEntryInput = Partial<Omit<CreateNutritionEntryInput, "ownerId">>;
export interface NutritionEntryListQuery extends OwnerQuery {}
export interface NutritionEntriesByDateQuery extends OwnerQuery {
  readonly date: IsoDateString;
}

export declare function createNutritionEntry(input: CreateNutritionEntryInput): Promise<NutritionEntry>;
export declare function updateNutritionEntry(id: NutritionEntryId, ownerId: OwnerId, input: UpdateNutritionEntryInput): Promise<NutritionEntry>;
export declare function deleteNutritionEntry(id: NutritionEntryId, ownerId: OwnerId): Promise<void>;
export declare function getNutritionEntry(id: NutritionEntryId, ownerId: OwnerId): Promise<NutritionEntry | null>;
export declare function listNutritionEntries(query: NutritionEntryListQuery): Promise<PageResult<NutritionEntry>>;
export declare function listNutritionEntriesByDate(query: NutritionEntriesByDateQuery): Promise<PageResult<NutritionEntry>>;
