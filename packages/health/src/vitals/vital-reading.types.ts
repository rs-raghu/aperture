import { z } from "@aperture/validation";
import { bloodGlucoseValueSchema, bloodPressureValueSchema, heartRateValueSchema, oxygenSaturationValueSchema, temperatureValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { orderedInstants } from "../internal/validation.helpers.js";

export const vitalReadingIdSchema = ownerIdSchema;
export type VitalReadingId = Readonly<z.infer<typeof vitalReadingIdSchema>>;

export const vitalReadingValueSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("resting_heart_rate"),
    value: heartRateValueSchema,
  }),
  z.strictObject({
    type: z.literal("blood_pressure"),
    value: bloodPressureValueSchema,
  }),
  z.strictObject({
    type: z.literal("blood_glucose"),
    value: bloodGlucoseValueSchema,
  }),
  z.strictObject({
    type: z.literal("oxygen_saturation"),
    value: oxygenSaturationValueSchema,
  }),
  z.strictObject({
    type: z.literal("body_temperature"),
    value: temperatureValueSchema,
  })
]).readonly();
export type VitalReadingValue = Readonly<z.infer<typeof vitalReadingValueSchema>>;

export const vitalReadingTypeSchema = z.enum(["resting_heart_rate", "blood_pressure", "blood_glucose", "oxygen_saturation", "body_temperature"]);
export type VitalReadingType = Readonly<z.infer<typeof vitalReadingTypeSchema>>;

export const vitalReadingSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: vitalReadingIdSchema,
  reading: vitalReadingValueSchema,
  observedAt: isoDateTimeStringSchema,
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type VitalReading = Readonly<z.infer<typeof vitalReadingSchema>>;
