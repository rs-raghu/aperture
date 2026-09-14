import { z } from "@aperture/validation";
import { ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { exerciseCategorySchema, exerciseStatusSchema } from "./exercise.types.js";
import type { OwnerId, PageResult } from "../health.types.js";
import type { Exercise, ExerciseId } from "./exercise.types.js";

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

// Lifecycle operations remain declaration-only until Phase 13.
export declare function createExercise(input: CreateExerciseInput): Promise<Exercise>;
export declare function updateExercise(id: ExerciseId, ownerId: OwnerId, input: UpdateExerciseInput): Promise<Exercise>;
export declare function archiveExercise(id: ExerciseId, ownerId: OwnerId): Promise<Exercise>;
export declare function getExercise(id: ExerciseId, ownerId: OwnerId): Promise<Exercise | null>;
export declare function listExercises(query: ExerciseListQuery): Promise<PageResult<Exercise>>;
export declare function listExercisesByCategory(query: ExercisesByCategoryQuery): Promise<PageResult<Exercise>>;
