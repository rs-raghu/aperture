import { z } from "@aperture/validation";
import { distanceValueSchema, durationValueSchema } from "../health-units.types.js";
import { isoDateStringSchema, isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { countSchema, textSchema } from "../internal/primitives.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const equipmentIdSchema = ownerIdSchema;
export type EquipmentId = Readonly<z.infer<typeof equipmentIdSchema>>;

export const equipmentCategorySchema = z.enum(["running_shoes", "strength", "cardio", "mobility", "other"]);
export type EquipmentCategory = Readonly<z.infer<typeof equipmentCategorySchema>>;

export const equipmentStatusSchema = z.enum(["active", "retired"]);
export type EquipmentStatus = Readonly<z.infer<typeof equipmentStatusSchema>>;

export const equipmentSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: equipmentIdSchema,
  name: textSchema,
  category: equipmentCategorySchema,
  status: equipmentStatusSchema,
  acquiredOn: isoDateStringSchema.optional(),
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type Equipment = Readonly<z.infer<typeof equipmentSchema>>;

export const equipmentUsageSummarySchema = z.strictObject({
  equipmentId: equipmentIdSchema,
  totalDistance: distanceValueSchema.optional(),
  totalDuration: durationValueSchema.optional(),
  useCount: countSchema,
}).readonly();
export type EquipmentUsageSummary = Readonly<z.infer<typeof equipmentUsageSummarySchema>>;
