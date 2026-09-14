import { z } from "@aperture/validation";
import { distanceValueSchema, durationValueSchema } from "../health-units.types.js";
import { isoDateStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { runningActivityIdSchema } from "../running/running-activity.types.js";
import { workoutSessionIdSchema } from "../workouts/workout-session.types.js";
import { equipmentCategorySchema, equipmentIdSchema, equipmentStatusSchema } from "./equipment.types.js";
import type { OwnerId, PageResult } from "../health.types.js";
import type { Equipment, EquipmentId, EquipmentUsageSummary } from "./equipment.types.js";

export const createEquipmentInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  name: textSchema,
  category: equipmentCategorySchema,
  acquiredOn: isoDateStringSchema.optional(),
}).readonly();
export type CreateEquipmentInput = Readonly<z.infer<typeof createEquipmentInputSchema>>;

export const updateEquipmentInputSchema = z.strictObject({
  name: textSchema.optional(),
  category: equipmentCategorySchema.optional(),
  status: equipmentStatusSchema.optional(),
  acquiredOn: isoDateStringSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateEquipmentInput = Readonly<z.infer<typeof updateEquipmentInputSchema>>;

export const equipmentListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  category: equipmentCategorySchema.optional(),
  status: equipmentStatusSchema.optional(),
}).readonly();
export type EquipmentListQuery = Readonly<z.infer<typeof equipmentListQuerySchema>>;

export const recordEquipmentUsageInputSchema = z.strictObject({
  equipmentId: equipmentIdSchema,
  ownerId: ownerIdSchema,
  workoutSessionId: workoutSessionIdSchema.optional(),
  runningActivityId: runningActivityIdSchema.optional(),
  distance: distanceValueSchema.optional(),
  duration: durationValueSchema.optional(),
}).readonly();
export type RecordEquipmentUsageInput = Readonly<z.infer<typeof recordEquipmentUsageInputSchema>>;

// Lifecycle operations remain declaration-only until Phase 13.
export declare function createEquipment(input: CreateEquipmentInput): Promise<Equipment>;
export declare function updateEquipment(id: EquipmentId, ownerId: OwnerId, input: UpdateEquipmentInput): Promise<Equipment>;
export declare function retireEquipment(id: EquipmentId, ownerId: OwnerId): Promise<Equipment>;
export declare function getEquipment(id: EquipmentId, ownerId: OwnerId): Promise<Equipment | null>;
export declare function listEquipment(query: EquipmentListQuery): Promise<PageResult<Equipment>>;
export declare function recordEquipmentUsage(input: RecordEquipmentUsageInput): Promise<EquipmentUsageSummary>;
export declare function getEquipmentUsageSummary(id: EquipmentId, ownerId: OwnerId): Promise<EquipmentUsageSummary>;
