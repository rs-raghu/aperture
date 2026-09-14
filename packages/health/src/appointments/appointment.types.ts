import { z } from "@aperture/validation";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const appointmentIdSchema = ownerIdSchema;
export type AppointmentId = Readonly<z.infer<typeof appointmentIdSchema>>;

export const appointmentStatusSchema = z.enum(["scheduled", "cancelled", "completed"]);
export type AppointmentStatus = Readonly<z.infer<typeof appointmentStatusSchema>>;

export const appointmentSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: appointmentIdSchema,
  title: textSchema,
  status: appointmentStatusSchema,
  startsAt: isoDateTimeStringSchema,
  endsAt: isoDateTimeStringSchema.optional(),
})
  .refine((value) => orderedInstants(value.startsAt, value.endsAt), { message: "End time must not be earlier than start time.", path: ["endsAt"] })
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type Appointment = Readonly<z.infer<typeof appointmentSchema>>;
