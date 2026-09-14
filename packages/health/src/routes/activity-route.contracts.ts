import { z } from "@aperture/validation";
import { distanceValueSchema } from "../health-units.types.js";
import { ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import type { OwnerId, PageResult } from "../health.types.js";
import type { ActivityRoute, ActivityRouteId } from "./activity-route.types.js";

export const createActivityRouteInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  title: textSchema,
  distance: distanceValueSchema.optional(),
}).readonly();
export type CreateActivityRouteInput = Readonly<z.infer<typeof createActivityRouteInputSchema>>;

export const updateActivityRouteInputSchema = z.strictObject({
  title: textSchema.optional(),
  distance: distanceValueSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateActivityRouteInput = Readonly<z.infer<typeof updateActivityRouteInputSchema>>;

export const activityRouteListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
}).readonly();
export type ActivityRouteListQuery = Readonly<z.infer<typeof activityRouteListQuerySchema>>;

// Lifecycle operations remain declaration-only until Phase 13.
export declare function createActivityRoute(input: CreateActivityRouteInput): Promise<ActivityRoute>;
export declare function updateActivityRoute(id: ActivityRouteId, ownerId: OwnerId, input: UpdateActivityRouteInput): Promise<ActivityRoute>;
export declare function deleteActivityRoute(id: ActivityRouteId, ownerId: OwnerId): Promise<void>;
export declare function getActivityRoute(id: ActivityRouteId, ownerId: OwnerId): Promise<ActivityRoute | null>;
export declare function listActivityRoutes(query: ActivityRouteListQuery): Promise<PageResult<ActivityRoute>>;
