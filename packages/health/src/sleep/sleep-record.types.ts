import { z } from "@aperture/validation";
import { durationValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const sleepRecordIdSchema = ownerIdSchema;
export type SleepRecordId = Readonly<z.infer<typeof sleepRecordIdSchema>>;

export const sleepQualitySchema = z.enum(["poor", "fair", "good", "excellent"]);
export type SleepQuality = Readonly<z.infer<typeof sleepQualitySchema>>;

export const sleepRecordSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: sleepRecordIdSchema,
  startedAt: isoDateTimeStringSchema,
  endedAt: isoDateTimeStringSchema,
  duration: durationValueSchema.optional(),
  quality: sleepQualitySchema.optional(),
})
  .refine((value) => orderedInstants(value.startedAt, value.endedAt), { message: "End time must not be earlier than start time.", path: ["endedAt"] })
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type SleepRecord = Readonly<z.infer<typeof sleepRecordSchema>>;
