import { z } from "@aperture/validation";
import { distanceValueSchema, heightValueSchema, weightValueSchema } from "../health-units.types.js";
import { dateRangeSchema, isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { healthMeasurementTypeSchema, healthMeasurementValueSchema } from "./health-measurement.types.js";
import type { OwnerId, PageResult } from "../health.types.js";
import type { HealthMeasurement, HealthMeasurementId } from "./health-measurement.types.js";

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

// Lifecycle operations remain declaration-only until Phase 13.
export declare function recordHealthMeasurement(input: RecordHealthMeasurementInput): Promise<HealthMeasurement>;
export declare function updateHealthMeasurement(id: HealthMeasurementId, ownerId: OwnerId, input: UpdateHealthMeasurementInput): Promise<HealthMeasurement>;
export declare function deleteHealthMeasurement(id: HealthMeasurementId, ownerId: OwnerId): Promise<void>;
export declare function getHealthMeasurement(id: HealthMeasurementId, ownerId: OwnerId): Promise<HealthMeasurement | null>;
export declare function listHealthMeasurements(query: HealthMeasurementListQuery): Promise<PageResult<HealthMeasurement>>;
export declare function listHealthMeasurementsByType(query: HealthMeasurementsByTypeQuery): Promise<PageResult<HealthMeasurement>>;
export declare function listHealthMeasurementsByDateRange(query: HealthMeasurementsByDateRangeQuery): Promise<PageResult<HealthMeasurement>>;
