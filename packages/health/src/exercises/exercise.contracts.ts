import { z } from "@aperture/validation";
import { ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { exerciseCategorySchema, exerciseStatusSchema } from "./exercise.types.js";

export const createExerciseInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  name: textSchema,
  category: exerciseCategorySchema,
}).readonly();
export type CreateExerciseInput = Readonly<z.infer<typeof createExerciseInputSchema>>;

export const updateExerciseInputSchema = z.strictObject({
  name: textSchema.optional(),
  category: exerciseCategorySchema.optional(),
  status: exerciseStatusSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateExerciseInput = Readonly<z.infer<typeof updateExerciseInputSchema>>;

export const exerciseListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  category: exerciseCategorySchema.optional(),
  status: exerciseStatusSchema.optional(),
}).readonly();
export type ExerciseListQuery = Readonly<z.infer<typeof exerciseListQuerySchema>>;

export const exercisesByCategoryQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  category: exerciseCategorySchema,
}).readonly();
export type ExercisesByCategoryQuery = Readonly<z.infer<typeof exercisesByCategoryQuerySchema>>;
