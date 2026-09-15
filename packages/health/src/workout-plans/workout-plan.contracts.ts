import { z } from "@aperture/validation";
import { isoDateStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate, orderedDates } from "../internal/validation.helpers.js";
import { workoutPlanStatusSchema } from "./workout-plan.types.js";

export const createWorkoutPlanInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  title: textSchema,
  startsOn: isoDateStringSchema.optional(),
  endsOn: isoDateStringSchema.optional(),
})
  .refine((value) => orderedDates(value.startsOn, value.endsOn), { message: "End date must not be earlier than start date.", path: ["endsOn"] }).readonly();
export type CreateWorkoutPlanInput = Readonly<z.infer<typeof createWorkoutPlanInputSchema>>;

export const updateWorkoutPlanInputSchema = z.strictObject({
  title: textSchema.optional(),
  status: workoutPlanStatusSchema.optional(),
  startsOn: isoDateStringSchema.optional(),
  endsOn: isoDateStringSchema.optional(),
})
  .refine((value) => orderedDates(value.startsOn, value.endsOn), { message: "End date must not be earlier than start date.", path: ["endsOn"] })
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateWorkoutPlanInput = Readonly<z.infer<typeof updateWorkoutPlanInputSchema>>;

export const workoutPlanListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  status: workoutPlanStatusSchema.optional(),
}).readonly();
export type WorkoutPlanListQuery = Readonly<z.infer<typeof workoutPlanListQuerySchema>>;
