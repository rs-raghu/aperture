import { z } from "@aperture/validation";
import { isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { laboratoryResultValueSchema } from "./laboratory-result.types.js";
import type { OwnerId, PageResult } from "../health.types.js";
import type { LaboratoryResult, LaboratoryResultId } from "./laboratory-result.types.js";

export const recordLaboratoryResultInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  testName: textSchema,
  result: laboratoryResultValueSchema,
  collectedAt: isoDateTimeStringSchema,
}).readonly();
export type RecordLaboratoryResultInput = Readonly<z.infer<typeof recordLaboratoryResultInputSchema>>;

export const updateLaboratoryResultInputSchema = z.strictObject({
  testName: textSchema.optional(),
  result: laboratoryResultValueSchema.optional(),
  collectedAt: isoDateTimeStringSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateLaboratoryResultInput = Readonly<z.infer<typeof updateLaboratoryResultInputSchema>>;

export const laboratoryResultListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
}).readonly();
export type LaboratoryResultListQuery = Readonly<z.infer<typeof laboratoryResultListQuerySchema>>;

// Lifecycle operations remain declaration-only until Phase 13.
export declare function recordLaboratoryResult(input: RecordLaboratoryResultInput): Promise<LaboratoryResult>;
export declare function updateLaboratoryResult(id: LaboratoryResultId, ownerId: OwnerId, input: UpdateLaboratoryResultInput): Promise<LaboratoryResult>;
export declare function deleteLaboratoryResult(id: LaboratoryResultId, ownerId: OwnerId): Promise<void>;
export declare function getLaboratoryResult(id: LaboratoryResultId, ownerId: OwnerId): Promise<LaboratoryResult | null>;
export declare function listLaboratoryResults(query: LaboratoryResultListQuery): Promise<PageResult<LaboratoryResult>>;
