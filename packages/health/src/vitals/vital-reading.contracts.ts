import { z } from "@aperture/validation";
import { dateRangeSchema, isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { vitalReadingTypeSchema, vitalReadingValueSchema } from "./vital-reading.types.js";
import type { OwnerId, PageResult } from "../health.types.js";
import type { VitalReading, VitalReadingId } from "./vital-reading.types.js";

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

// Lifecycle operations remain declaration-only until Phase 13.
export declare function recordVitalReading(input: RecordVitalReadingInput): Promise<VitalReading>;
export declare function updateVitalReading(id: VitalReadingId, ownerId: OwnerId, input: UpdateVitalReadingInput): Promise<VitalReading>;
export declare function deleteVitalReading(id: VitalReadingId, ownerId: OwnerId): Promise<void>;
export declare function getVitalReading(id: VitalReadingId, ownerId: OwnerId): Promise<VitalReading | null>;
export declare function listVitalReadings(query: VitalReadingListQuery): Promise<PageResult<VitalReading>>;
export declare function listVitalReadingsByType(query: VitalReadingsByTypeQuery): Promise<PageResult<VitalReading>>;
export declare function listVitalReadingsByDateRange(query: VitalReadingsByDateRangeQuery): Promise<PageResult<VitalReading>>;
