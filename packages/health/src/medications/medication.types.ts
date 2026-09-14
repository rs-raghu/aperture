import { z } from "@aperture/validation";
import { isoDateStringSchema, isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { orderedDates, orderedInstants } from "../internal/validation.helpers.js";

export const medicationIdSchema = ownerIdSchema;
export type MedicationId = Readonly<z.infer<typeof medicationIdSchema>>;

export const medicationStatusSchema = z.enum(["active", "archived"]);
export type MedicationStatus = Readonly<z.infer<typeof medicationStatusSchema>>;

export const medicationSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: medicationIdSchema,
  name: textSchema,
  status: medicationStatusSchema,
  startedOn: isoDateStringSchema.optional(),
  endedOn: isoDateStringSchema.optional(),
})
  .refine((value) => orderedDates(value.startedOn, value.endedOn), { message: "End date must not be earlier than start date.", path: ["endedOn"] })
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type Medication = Readonly<z.infer<typeof medicationSchema>>;
