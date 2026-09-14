import { z } from "@aperture/validation";
import { distanceValueSchema, heightValueSchema, weightValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const healthMeasurementIdSchema = ownerIdSchema;
export type HealthMeasurementId = Readonly<z.infer<typeof healthMeasurementIdSchema>>;

export const healthMeasurementTypeSchema = z.enum(["weight", "height", "waist", "hip"]);
export type HealthMeasurementType = Readonly<z.infer<typeof healthMeasurementTypeSchema>>;

export const healthMeasurementValueSchema = z.union([weightValueSchema, heightValueSchema, distanceValueSchema]);
export type HealthMeasurementValue = Readonly<z.infer<typeof healthMeasurementValueSchema>>;

export const healthMeasurementSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: healthMeasurementIdSchema,
  type: healthMeasurementTypeSchema,
  measurement: healthMeasurementValueSchema,
  observedAt: isoDateTimeStringSchema,
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] })
  .refine(({ type, measurement }) => {
    const expected = type === "weight" ? weightValueSchema : type === "height" ? heightValueSchema : distanceValueSchema;
    return expected.safeParse(measurement).success;
  }, { message: "Measurement unit must match the selected type.", path: ["measurement", "unit"] }).readonly();
export type HealthMeasurement = Readonly<z.infer<typeof healthMeasurementSchema>>;
