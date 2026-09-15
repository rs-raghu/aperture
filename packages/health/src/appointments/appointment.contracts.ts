import { z } from "@aperture/validation";
import { isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate, orderedInstants } from "../internal/validation.helpers.js";
import { appointmentStatusSchema } from "./appointment.types.js";

export const createAppointmentInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  title: textSchema,
  startsAt: isoDateTimeStringSchema,
  endsAt: isoDateTimeStringSchema.optional(),
})
  .refine((value) => orderedInstants(value.startsAt, value.endsAt), { message: "End time must not be earlier than start time.", path: ["endsAt"] }).readonly();
export type CreateAppointmentInput = Readonly<z.infer<typeof createAppointmentInputSchema>>;

export const updateAppointmentInputSchema = z.strictObject({
  title: textSchema.optional(),
  status: appointmentStatusSchema.optional(),
  startsAt: isoDateTimeStringSchema.optional(),
  endsAt: isoDateTimeStringSchema.optional(),
})
  .refine((value) => orderedInstants(value.startsAt, value.endsAt), { message: "End time must not be earlier than start time.", path: ["endsAt"] })
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateAppointmentInput = Readonly<z.infer<typeof updateAppointmentInputSchema>>;

export const appointmentListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  status: appointmentStatusSchema.optional(),
}).readonly();
export type AppointmentListQuery = Readonly<z.infer<typeof appointmentListQuerySchema>>;

export const upcomingAppointmentsQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  startsBefore: isoDateTimeStringSchema.optional(),
}).readonly();
export type UpcomingAppointmentsQuery = Readonly<z.infer<typeof upcomingAppointmentsQuerySchema>>;
