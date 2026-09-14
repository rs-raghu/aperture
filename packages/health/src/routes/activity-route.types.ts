import { z } from "@aperture/validation";
import { distanceValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const activityRouteIdSchema = ownerIdSchema;
export type ActivityRouteId = Readonly<z.infer<typeof activityRouteIdSchema>>;

export const activityRouteSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: activityRouteIdSchema,
  title: textSchema,
  distance: distanceValueSchema.optional(),
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type ActivityRoute = Readonly<z.infer<typeof activityRouteSchema>>;
