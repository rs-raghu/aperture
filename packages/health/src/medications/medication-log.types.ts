import { z } from "@aperture/validation";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { orderedInstants } from "../internal/validation.helpers.js";
import { medicationIdSchema } from "./medication.types.js";

export const medicationLogIdSchema = ownerIdSchema;
export type MedicationLogId = Readonly<z.infer<typeof medicationLogIdSchema>>;

export const medicationLogStatusSchema = z.enum(["taken", "skipped"]);
export type MedicationLogStatus = Readonly<z.infer<typeof medicationLogStatusSchema>>;

export const medicationLogSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: medicationLogIdSchema,
  medicationId: medicationIdSchema,
  status: medicationLogStatusSchema,
  scheduledAt: isoDateTimeStringSchema.optional(),
  recordedAt: isoDateTimeStringSchema,
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type MedicationLog = Readonly<z.infer<typeof medicationLogSchema>>;
