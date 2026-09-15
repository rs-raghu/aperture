import { z } from "@aperture/validation";
import { distanceValueSchema, heightValueSchema, weightValueSchema } from "../health-units.types.js";
import { dateRangeSchema, isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { healthMeasurementTypeSchema, healthMeasurementValueSchema } from "./health-measurement.types.js";

export const recordHealthMeasurementInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  type: healthMeasurementTypeSchema,
  measurement: healthMeasurementValueSchema,
  observedAt: isoDateTimeStringSchema,
})
  .refine(({ type, measurement }) => {
    const expected = type === "weight" ? weightValueSchema : type === "height" ? heightValueSchema : distanceValueSchema;
    return expected.safeParse(measurement).success;
  }, { message: "Measurement unit must match the selected type.", path: ["measurement", "unit"] }).readonly();
export type RecordHealthMeasurementInput = Readonly<z.infer<typeof recordHealthMeasurementInputSchema>>;

export const updateHealthMeasurementInputSchema = z.strictObject({
  measurement: healthMeasurementValueSchema.optional(),
  observedAt: isoDateTimeStringSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateHealthMeasurementInput = Readonly<z.infer<typeof updateHealthMeasurementInputSchema>>;

export const healthMeasurementListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  type: healthMeasurementTypeSchema.optional(),
}).readonly();
export type HealthMeasurementListQuery = Readonly<z.infer<typeof healthMeasurementListQuerySchema>>;

export const healthMeasurementsByTypeQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  type: healthMeasurementTypeSchema,
}).readonly();
export type HealthMeasurementsByTypeQuery = Readonly<z.infer<typeof healthMeasurementsByTypeQuerySchema>>;

export const healthMeasurementsByDateRangeQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  range: dateRangeSchema,
}).readonly();
export type HealthMeasurementsByDateRangeQuery = Readonly<z.infer<typeof healthMeasurementsByDateRangeQuerySchema>>;
