import { z } from "@aperture/validation";
import { exerciseIdSchema } from "../exercises/exercise.types.js";
import { isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { runningActivityIdSchema } from "../running/running-activity.types.js";
import { personalRecordMetricSchema } from "./personal-record.types.js";

export const recordPersonalRecordInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  exerciseId: exerciseIdSchema.optional(),
  runningActivityId: runningActivityIdSchema.optional(),
  title: textSchema,
  metric: personalRecordMetricSchema,
  achievedAt: isoDateTimeStringSchema,
}).readonly();
export type RecordPersonalRecordInput = Readonly<z.infer<typeof recordPersonalRecordInputSchema>>;

export const updatePersonalRecordInputSchema = z.strictObject({
  title: textSchema.optional(),
  metric: personalRecordMetricSchema.optional(),
  achievedAt: isoDateTimeStringSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdatePersonalRecordInput = Readonly<z.infer<typeof updatePersonalRecordInputSchema>>;

export const personalRecordListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  exerciseId: exerciseIdSchema.optional(),
}).readonly();
export type PersonalRecordListQuery = Readonly<z.infer<typeof personalRecordListQuerySchema>>;
