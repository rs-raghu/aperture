import { z } from "@aperture/validation";
import { distanceValueSchema, durationValueSchema } from "../health-units.types.js";
import { ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { sequenceSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { runningActivityIdSchema } from "../running/running-activity.types.js";
import type { OwnerId, PageResult } from "../health.types.js";
import type { RunningSplit, RunningSplitId } from "./running-split.types.js";

export const recordRunningSplitInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  runningActivityId: runningActivityIdSchema,
  sequence: sequenceSchema,
  distance: distanceValueSchema,
  duration: durationValueSchema,
}).readonly();
export type RecordRunningSplitInput = Readonly<z.infer<typeof recordRunningSplitInputSchema>>;

export const updateRunningSplitInputSchema = z.strictObject({
  sequence: sequenceSchema.optional(),
  distance: distanceValueSchema.optional(),
  duration: durationValueSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateRunningSplitInput = Readonly<z.infer<typeof updateRunningSplitInputSchema>>;

export const runningSplitListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  runningActivityId: runningActivityIdSchema.optional(),
}).readonly();
export type RunningSplitListQuery = Readonly<z.infer<typeof runningSplitListQuerySchema>>;

export const runningSplitsByActivityQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  runningActivityId: runningActivityIdSchema,
}).readonly();
export type RunningSplitsByActivityQuery = Readonly<z.infer<typeof runningSplitsByActivityQuerySchema>>;

// Lifecycle operations remain declaration-only until Phase 13.
export declare function recordRunningSplit(input: RecordRunningSplitInput): Promise<RunningSplit>;
export declare function updateRunningSplit(id: RunningSplitId, ownerId: OwnerId, input: UpdateRunningSplitInput): Promise<RunningSplit>;
export declare function deleteRunningSplit(id: RunningSplitId, ownerId: OwnerId): Promise<void>;
export declare function listRunningSplitsByActivity(query: RunningSplitsByActivityQuery): Promise<PageResult<RunningSplit>>;
