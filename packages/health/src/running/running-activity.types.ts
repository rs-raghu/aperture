import { z } from "@aperture/validation";
import { equipmentIdSchema } from "../equipment/equipment.types.js";
import { distanceValueSchema, durationValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { orderedInstants } from "../internal/validation.helpers.js";
import { activityRouteIdSchema } from "../routes/activity-route.types.js";
import { workoutSessionIdSchema } from "../workouts/workout-session.types.js";

export const runningActivityIdSchema = ownerIdSchema;
export type RunningActivityId = Readonly<z.infer<typeof runningActivityIdSchema>>;

export const runningActivityStatusSchema = z.enum(["planned", "in_progress", "completed"]);
export type RunningActivityStatus = Readonly<z.infer<typeof runningActivityStatusSchema>>;

export const runningActivitySchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: runningActivityIdSchema,
  workoutSessionId: workoutSessionIdSchema.optional(),
  routeId: activityRouteIdSchema.optional(),
  equipmentIds: z.array(equipmentIdSchema).readonly().optional(),
  title: textSchema,
  status: runningActivityStatusSchema,
  startedAt: isoDateTimeStringSchema,
  endedAt: isoDateTimeStringSchema.optional(),
  distance: distanceValueSchema.optional(),
  duration: durationValueSchema.optional(),
})
  .refine((value) => orderedInstants(value.startedAt, value.endedAt), { message: "End time must not be earlier than start time.", path: ["endedAt"] })
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type RunningActivity = Readonly<z.infer<typeof runningActivitySchema>>;
