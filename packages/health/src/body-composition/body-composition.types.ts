import { z } from "@aperture/validation";
import { distanceValueSchema, heightValueSchema, percentageValueSchema, weightValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const bodyCompositionRecordIdSchema = ownerIdSchema;
export type BodyCompositionRecordId = Readonly<z.infer<typeof bodyCompositionRecordIdSchema>>;

export const bodyCompositionRecordSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: bodyCompositionRecordIdSchema,
  observedAt: isoDateTimeStringSchema,
  weight: weightValueSchema.optional(),
  height: heightValueSchema.optional(),
  bodyFat: percentageValueSchema.optional(),
  waist: distanceValueSchema.optional(),
  hip: distanceValueSchema.optional(),
  muscleMass: weightValueSchema.optional(),
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type BodyCompositionRecord = Readonly<z.infer<typeof bodyCompositionRecordSchema>>;
