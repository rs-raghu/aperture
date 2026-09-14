import { z } from "@aperture/validation";
import { distanceValueSchema, heightValueSchema, percentageValueSchema, weightValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import type { OwnerId, PageResult } from "../health.types.js";
import type { BodyCompositionRecord, BodyCompositionRecordId } from "./body-composition.types.js";

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

// Lifecycle operations remain declaration-only until Phase 13.
export declare function recordBodyComposition(input: RecordBodyCompositionInput): Promise<BodyCompositionRecord>;
export declare function updateBodyComposition(id: BodyCompositionRecordId, ownerId: OwnerId, input: UpdateBodyCompositionInput): Promise<BodyCompositionRecord>;
export declare function deleteBodyComposition(id: BodyCompositionRecordId, ownerId: OwnerId): Promise<void>;
export declare function getBodyComposition(id: BodyCompositionRecordId, ownerId: OwnerId): Promise<BodyCompositionRecord | null>;
export declare function listBodyCompositionRecords(query: BodyCompositionListQuery): Promise<PageResult<BodyCompositionRecord>>;
