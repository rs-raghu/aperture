import { z } from "@aperture/validation";
import { isoDateStringSchema, isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { orderedDates, orderedInstants } from "../internal/validation.helpers.js";

export const workoutPlanIdSchema = ownerIdSchema;
export type WorkoutPlanId = Readonly<z.infer<typeof workoutPlanIdSchema>>;

export const workoutPlanStatusSchema = z.enum(["draft", "active", "archived"]);
export type WorkoutPlanStatus = Readonly<z.infer<typeof workoutPlanStatusSchema>>;

export const workoutPlanSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: workoutPlanIdSchema,
  title: textSchema,
  status: workoutPlanStatusSchema,
  startsOn: isoDateStringSchema.optional(),
  endsOn: isoDateStringSchema.optional(),
})
  .refine((value) => orderedDates(value.startsOn, value.endsOn), { message: "End date must not be earlier than start date.", path: ["endsOn"] })
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type WorkoutPlan = Readonly<z.infer<typeof workoutPlanSchema>>;
