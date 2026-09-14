import { z } from "@aperture/validation";
import { heartRateValueSchema, heartRateVariabilityValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const recoveryEntryIdSchema = ownerIdSchema;
export type RecoveryEntryId = Readonly<z.infer<typeof recoveryEntryIdSchema>>;

export const recoveryRatingSchema = z.strictObject({
  value: z.number().finite().min(1).max(10),
  scale: z.literal("one_to_ten"),
}).readonly();
export type RecoveryRating = Readonly<z.infer<typeof recoveryRatingSchema>>;

export const recoveryEntrySchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: recoveryEntryIdSchema,
  observedAt: isoDateTimeStringSchema,
  energy: recoveryRatingSchema.optional(),
  soreness: recoveryRatingSchema.optional(),
  fatigue: recoveryRatingSchema.optional(),
  mood: recoveryRatingSchema.optional(),
  restingHeartRate: heartRateValueSchema.optional(),
  heartRateVariability: heartRateVariabilityValueSchema.optional(),
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type RecoveryEntry = Readonly<z.infer<typeof recoveryEntrySchema>>;
