import { z } from "@aperture/validation";
import { isoDateStringSchema, measurementSystemSchema, ownerIdSchema } from "../health.types.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { healthProfileStatusSchema } from "./health-profile.types.js";
import type { OwnerId } from "../health.types.js";
import type { HealthProfile, HealthProfileId } from "./health-profile.types.js";

export const createHealthProfileInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  measurementSystem: measurementSystemSchema,
  birthDate: isoDateStringSchema.optional(),
}).readonly();
export type CreateHealthProfileInput = Readonly<z.infer<typeof createHealthProfileInputSchema>>;

export const updateHealthProfileInputSchema = z.strictObject({
  measurementSystem: measurementSystemSchema.optional(),
  birthDate: isoDateStringSchema.optional(),
  status: healthProfileStatusSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateHealthProfileInput = Readonly<z.infer<typeof updateHealthProfileInputSchema>>;

// Lifecycle operations remain declaration-only until Phase 13.
export declare function createHealthProfile(input: CreateHealthProfileInput): Promise<HealthProfile>;
export declare function updateHealthProfile(
  id: HealthProfileId,
  ownerId: OwnerId,
  input: UpdateHealthProfileInput,
): Promise<HealthProfile>;
export declare function getHealthProfile(ownerId: OwnerId): Promise<HealthProfile | null>;
