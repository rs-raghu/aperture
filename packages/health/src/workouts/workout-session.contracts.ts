import { z } from "@aperture/validation";
import { dateRangeSchema, isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { workoutPlanIdSchema } from "../workout-plans/workout-plan.types.js";

export const createWorkoutSessionInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  workoutPlanId: workoutPlanIdSchema.optional(),
  title: textSchema,
  scheduledAt: isoDateTimeStringSchema.optional(),
}).readonly();
export type CreateWorkoutSessionInput = Readonly<z.infer<typeof createWorkoutSessionInputSchema>>;

export const updateWorkoutSessionInputSchema = z.strictObject({
  workoutPlanId: workoutPlanIdSchema.optional(),
  title: textSchema.optional(),
  scheduledAt: isoDateTimeStringSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateWorkoutSessionInput = Readonly<z.infer<typeof updateWorkoutSessionInputSchema>>;

export const workoutSessionListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
}).readonly();
export type WorkoutSessionListQuery = Readonly<z.infer<typeof workoutSessionListQuerySchema>>;

export const workoutSessionsByDateRangeQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  range: dateRangeSchema,
}).readonly();
export type WorkoutSessionsByDateRangeQuery = Readonly<z.infer<typeof workoutSessionsByDateRangeQuerySchema>>;
