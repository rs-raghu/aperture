import { z } from "@aperture/validation";
import { exerciseIdSchema } from "../exercises/exercise.types.js";
import { distanceValueSchema, durationValueSchema, paceValueSchema, repetitionCountSchema, weightValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { orderedInstants } from "../internal/validation.helpers.js";
import { runningActivityIdSchema } from "../running/running-activity.types.js";

export const personalRecordIdSchema = ownerIdSchema;
export type PersonalRecordId = Readonly<z.infer<typeof personalRecordIdSchema>>;

export const personalRecordMetricSchema = z.discriminatedUnion("type", [
  z.strictObject({
    type: z.literal("distance"),
    value: distanceValueSchema,
  }),
  z.strictObject({
    type: z.literal("duration"),
    value: durationValueSchema,
  }),
  z.strictObject({
    type: z.literal("pace"),
    value: paceValueSchema,
  }),
  z.strictObject({
    type: z.literal("repetitions"),
    value: repetitionCountSchema,
  }),
  z.strictObject({
    type: z.literal("weight"),
    value: weightValueSchema,
  })
]).readonly();
export type PersonalRecordMetric = Readonly<z.infer<typeof personalRecordMetricSchema>>;

export const personalRecordSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: personalRecordIdSchema,
  exerciseId: exerciseIdSchema.optional(),
  runningActivityId: runningActivityIdSchema.optional(),
  title: textSchema,
  metric: personalRecordMetricSchema,
  achievedAt: isoDateTimeStringSchema,
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type PersonalRecord = Readonly<z.infer<typeof personalRecordSchema>>;
