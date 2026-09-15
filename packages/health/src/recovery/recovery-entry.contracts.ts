import { z } from "@aperture/validation";
import { heartRateValueSchema, heartRateVariabilityValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { recoveryRatingSchema } from "./recovery-entry.types.js";

export const recordRecoveryEntryInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  observedAt: isoDateTimeStringSchema,
  energy: recoveryRatingSchema.optional(),
  soreness: recoveryRatingSchema.optional(),
  fatigue: recoveryRatingSchema.optional(),
  mood: recoveryRatingSchema.optional(),
  restingHeartRate: heartRateValueSchema.optional(),
  heartRateVariability: heartRateVariabilityValueSchema.optional(),
}).readonly();
export type RecordRecoveryEntryInput = Readonly<z.infer<typeof recordRecoveryEntryInputSchema>>;

export const updateRecoveryEntryInputSchema = z.strictObject({
  observedAt: isoDateTimeStringSchema.optional(),
  energy: recoveryRatingSchema.optional(),
  soreness: recoveryRatingSchema.optional(),
  fatigue: recoveryRatingSchema.optional(),
  mood: recoveryRatingSchema.optional(),
  restingHeartRate: heartRateValueSchema.optional(),
  heartRateVariability: heartRateVariabilityValueSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateRecoveryEntryInput = Readonly<z.infer<typeof updateRecoveryEntryInputSchema>>;

export const recoveryEntryListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
}).readonly();
export type RecoveryEntryListQuery = Readonly<z.infer<typeof recoveryEntryListQuerySchema>>;
