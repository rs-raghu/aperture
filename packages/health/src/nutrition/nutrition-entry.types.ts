import { z } from "@aperture/validation";
import { energyValueSchema, nutritionMassValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const nutritionEntryIdSchema = ownerIdSchema;
export type NutritionEntryId = Readonly<z.infer<typeof nutritionEntryIdSchema>>;

export const mealTypeSchema = z.enum(["breakfast", "lunch", "dinner", "snack", "other"]);
export type MealType = Readonly<z.infer<typeof mealTypeSchema>>;

export const nutritionEntrySchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: nutritionEntryIdSchema,
  title: textSchema,
  mealType: mealTypeSchema,
  consumedAt: isoDateTimeStringSchema,
  energy: energyValueSchema.optional(),
  protein: nutritionMassValueSchema.optional(),
  carbohydrate: nutritionMassValueSchema.optional(),
  fat: nutritionMassValueSchema.optional(),
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type NutritionEntry = Readonly<z.infer<typeof nutritionEntrySchema>>;
