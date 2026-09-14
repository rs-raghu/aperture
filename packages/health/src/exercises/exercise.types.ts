import { z } from "@aperture/validation";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const exerciseIdSchema = ownerIdSchema;
export type ExerciseId = Readonly<z.infer<typeof exerciseIdSchema>>;

export const exerciseCategorySchema = z.enum(["strength", "cardio", "mobility", "balance", "other"]);
export type ExerciseCategory = Readonly<z.infer<typeof exerciseCategorySchema>>;

export const exerciseStatusSchema = z.enum(["active", "archived"]);
export type ExerciseStatus = Readonly<z.infer<typeof exerciseStatusSchema>>;

export const exerciseSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: exerciseIdSchema,
  name: textSchema,
  category: exerciseCategorySchema,
  status: exerciseStatusSchema,
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type Exercise = Readonly<z.infer<typeof exerciseSchema>>;
