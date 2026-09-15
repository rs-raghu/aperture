import { z } from "@aperture/validation";
import { dateRangeSchema, isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { vitalReadingTypeSchema, vitalReadingValueSchema } from "./vital-reading.types.js";

export const recordVitalReadingInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  reading: vitalReadingValueSchema,
  observedAt: isoDateTimeStringSchema,
}).readonly();
export type RecordVitalReadingInput = Readonly<z.infer<typeof recordVitalReadingInputSchema>>;

export const updateVitalReadingInputSchema = z.strictObject({
  reading: vitalReadingValueSchema.optional(),
  observedAt: isoDateTimeStringSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateVitalReadingInput = Readonly<z.infer<typeof updateVitalReadingInputSchema>>;

export const vitalReadingListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  type: vitalReadingTypeSchema.optional(),
}).readonly();
export type VitalReadingListQuery = Readonly<z.infer<typeof vitalReadingListQuerySchema>>;

export const vitalReadingsByTypeQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  type: vitalReadingTypeSchema,
}).readonly();
export type VitalReadingsByTypeQuery = Readonly<z.infer<typeof vitalReadingsByTypeQuerySchema>>;

export const vitalReadingsByDateRangeQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  range: dateRangeSchema,
}).readonly();
export type VitalReadingsByDateRangeQuery = Readonly<z.infer<typeof vitalReadingsByDateRangeQuerySchema>>;
