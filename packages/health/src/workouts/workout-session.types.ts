import { z } from "@aperture/validation";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { orderedInstants } from "../internal/validation.helpers.js";
import { workoutPlanIdSchema } from "../workout-plans/workout-plan.types.js";

export const workoutSessionIdSchema = ownerIdSchema;
export type WorkoutSessionId = Readonly<z.infer<typeof workoutSessionIdSchema>>;

export const workoutSessionStatusSchema = z.enum(["planned", "in_progress", "paused", "completed", "cancelled"]);
export type WorkoutSessionStatus = Readonly<z.infer<typeof workoutSessionStatusSchema>>;

export const workoutSessionSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: workoutSessionIdSchema,
  workoutPlanId: workoutPlanIdSchema.optional(),
  title: textSchema,
  status: workoutSessionStatusSchema,
  scheduledAt: isoDateTimeStringSchema.optional(),
  startedAt: isoDateTimeStringSchema.optional(),
  endedAt: isoDateTimeStringSchema.optional(),
})
  .refine((value) => orderedInstants(value.startedAt, value.endedAt), { message: "End time must not be earlier than start time.", path: ["endedAt"] })
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type WorkoutSession = Readonly<z.infer<typeof workoutSessionSchema>>;
