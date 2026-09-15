import { z } from "@aperture/validation";
import { distanceValueSchema, heightValueSchema, percentageValueSchema, weightValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";

export const recordBodyCompositionInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  observedAt: isoDateTimeStringSchema,
  weight: weightValueSchema.optional(),
  height: heightValueSchema.optional(),
  bodyFat: percentageValueSchema.optional(),
  waist: distanceValueSchema.optional(),
  hip: distanceValueSchema.optional(),
  muscleMass: weightValueSchema.optional(),
}).readonly();
export type RecordBodyCompositionInput = Readonly<z.infer<typeof recordBodyCompositionInputSchema>>;

export const updateBodyCompositionInputSchema = z.strictObject({
  observedAt: isoDateTimeStringSchema,
  weight: weightValueSchema.optional(),
  height: heightValueSchema.optional(),
  bodyFat: percentageValueSchema.optional(),
  waist: distanceValueSchema.optional(),
  hip: distanceValueSchema.optional(),
  muscleMass: weightValueSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateBodyCompositionInput = Readonly<z.infer<typeof updateBodyCompositionInputSchema>>;

export const bodyCompositionListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
}).readonly();
export type BodyCompositionListQuery = Readonly<z.infer<typeof bodyCompositionListQuerySchema>>;
