import { z } from "@aperture/validation";
import { distanceValueSchema, durationValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { sequenceSchema } from "../internal/primitives.js";
import { orderedInstants } from "../internal/validation.helpers.js";
import { runningActivityIdSchema } from "../running/running-activity.types.js";

export const runningSplitIdSchema = ownerIdSchema;
export type RunningSplitId = Readonly<z.infer<typeof runningSplitIdSchema>>;

export const runningSplitSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: runningSplitIdSchema,
  runningActivityId: runningActivityIdSchema,
  sequence: sequenceSchema,
  distance: distanceValueSchema,
  duration: durationValueSchema,
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type RunningSplit = Readonly<z.infer<typeof runningSplitSchema>>;
