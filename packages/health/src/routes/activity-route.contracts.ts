import { z } from "@aperture/validation";
import { distanceValueSchema } from "../health-units.types.js";
import { ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";

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
