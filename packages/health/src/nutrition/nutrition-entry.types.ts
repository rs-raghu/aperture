import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";
import type { EnergyValue, NutritionMassValue } from "../health-units.types.js";

export type NutritionEntryId = string;
export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "other";

export interface NutritionEntry extends EntityMetadata {
  readonly id: NutritionEntryId;
  readonly title: string;
  readonly mealType: MealType;
  readonly consumedAt: IsoDateTimeString;
  readonly energy?: EnergyValue;
  readonly protein?: NutritionMassValue;
  readonly carbohydrate?: NutritionMassValue;
  readonly fat?: NutritionMassValue;
}
