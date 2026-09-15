import { z } from "@aperture/validation";
import { energyValueSchema, nutritionMassValueSchema } from "../health-units.types.js";
import { isoDateStringSchema, isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { mealTypeSchema } from "./nutrition-entry.types.js";

export const createNutritionEntryInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  title: textSchema,
  mealType: mealTypeSchema,
  consumedAt: isoDateTimeStringSchema,
  energy: energyValueSchema.optional(),
  protein: nutritionMassValueSchema.optional(),
  carbohydrate: nutritionMassValueSchema.optional(),
  fat: nutritionMassValueSchema.optional(),
}).readonly();
export type CreateNutritionEntryInput = Readonly<z.infer<typeof createNutritionEntryInputSchema>>;

export const updateNutritionEntryInputSchema = z.strictObject({
  title: textSchema.optional(),
  mealType: mealTypeSchema.optional(),
  consumedAt: isoDateTimeStringSchema.optional(),
  energy: energyValueSchema.optional(),
  protein: nutritionMassValueSchema.optional(),
  carbohydrate: nutritionMassValueSchema.optional(),
  fat: nutritionMassValueSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateNutritionEntryInput = Readonly<z.infer<typeof updateNutritionEntryInputSchema>>;

export const nutritionEntryListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
}).readonly();
export type NutritionEntryListQuery = Readonly<z.infer<typeof nutritionEntryListQuerySchema>>;

export const nutritionEntriesByDateQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  date: isoDateStringSchema,
}).readonly();
export type NutritionEntriesByDateQuery = Readonly<z.infer<typeof nutritionEntriesByDateQuerySchema>>;
