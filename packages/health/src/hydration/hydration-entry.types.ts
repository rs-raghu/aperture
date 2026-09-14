import { z } from "@aperture/validation";
import { hydrationVolumeValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const hydrationEntryIdSchema = ownerIdSchema;
export type HydrationEntryId = Readonly<z.infer<typeof hydrationEntryIdSchema>>;

export const hydrationEntrySchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: hydrationEntryIdSchema,
  volume: hydrationVolumeValueSchema,
  consumedAt: isoDateTimeStringSchema,
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type HydrationEntry = Readonly<z.infer<typeof hydrationEntrySchema>>;
