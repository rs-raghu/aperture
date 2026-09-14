import { z } from "@aperture/validation";
import { isoDateStringSchema, isoDateTimeStringSchema, measurementSystemSchema, ownerIdSchema } from "../health.types.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const healthProfileIdSchema = ownerIdSchema;
export type HealthProfileId = Readonly<z.infer<typeof healthProfileIdSchema>>;

export const healthProfileStatusSchema = z.enum(["active", "archived"]);
export type HealthProfileStatus = Readonly<z.infer<typeof healthProfileStatusSchema>>;

export const healthProfileSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: healthProfileIdSchema,
  measurementSystem: measurementSystemSchema,
  birthDate: isoDateStringSchema.optional(),
  status: healthProfileStatusSchema,
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type HealthProfile = Readonly<z.infer<typeof healthProfileSchema>>;
