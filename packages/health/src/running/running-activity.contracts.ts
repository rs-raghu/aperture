import { z } from "@aperture/validation";
import { equipmentIdSchema } from "../equipment/equipment.types.js";
import { distanceValueSchema, durationValueSchema } from "../health-units.types.js";
import { dateRangeSchema, isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate, orderedInstants } from "../internal/validation.helpers.js";
import { activityRouteIdSchema } from "../routes/activity-route.types.js";
import { workoutSessionIdSchema } from "../workouts/workout-session.types.js";
import type { IsoDateTimeString, OwnerId, PageResult } from "../health.types.js";
import type { RunningActivity, RunningActivityId } from "./running-activity.types.js";

export const createRunningActivityInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  workoutSessionId: workoutSessionIdSchema.optional(),
  routeId: activityRouteIdSchema.optional(),
  equipmentIds: z.array(equipmentIdSchema).readonly().optional(),
  title: textSchema,
  startedAt: isoDateTimeStringSchema,
}).readonly();
export type CreateRunningActivityInput = Readonly<z.infer<typeof createRunningActivityInputSchema>>;

export const updateRunningActivityInputSchema = z.strictObject({
  routeId: activityRouteIdSchema.optional(),
  equipmentIds: z.array(equipmentIdSchema).readonly().optional(),
  title: textSchema.optional(),
  startedAt: isoDateTimeStringSchema.optional(),
  endedAt: isoDateTimeStringSchema.optional(),
  distance: distanceValueSchema.optional(),
  duration: durationValueSchema.optional(),
})
  .refine((value) => orderedInstants(value.startedAt, value.endedAt), { message: "End time must not be earlier than start time.", path: ["endedAt"] })
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateRunningActivityInput = Readonly<z.infer<typeof updateRunningActivityInputSchema>>;

export const runningActivityListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
}).readonly();
export type RunningActivityListQuery = Readonly<z.infer<typeof runningActivityListQuerySchema>>;

export const runningActivitiesByDateRangeQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  range: dateRangeSchema,
}).readonly();
export type RunningActivitiesByDateRangeQuery = Readonly<z.infer<typeof runningActivitiesByDateRangeQuerySchema>>;

// Lifecycle operations remain declaration-only until Phase 13.
export declare function createRunningActivity(input: CreateRunningActivityInput): Promise<RunningActivity>;
export declare function updateRunningActivity(id: RunningActivityId, ownerId: OwnerId, input: UpdateRunningActivityInput): Promise<RunningActivity>;
export declare function completeRunningActivity(id: RunningActivityId, ownerId: OwnerId, completedAt: IsoDateTimeString): Promise<RunningActivity>;
export declare function deleteRunningActivity(id: RunningActivityId, ownerId: OwnerId): Promise<void>;
export declare function getRunningActivity(id: RunningActivityId, ownerId: OwnerId): Promise<RunningActivity | null>;
export declare function listRunningActivities(query: RunningActivityListQuery): Promise<PageResult<RunningActivity>>;
export declare function listRunningActivitiesByDateRange(query: RunningActivitiesByDateRangeQuery): Promise<PageResult<RunningActivity>>;
