import { z } from "@aperture/validation";
import { exerciseIdSchema } from "../exercises/exercise.types.js";
import { distanceValueSchema, durationValueSchema, repetitionCountSchema, weightValueSchema } from "../health-units.types.js";
import { isoDateTimeStringSchema, ownerIdSchema } from "../health.types.js";
import { sequenceSchema } from "../internal/primitives.js";
import { orderedInstants } from "../internal/validation.helpers.js";
import { workoutSessionIdSchema } from "../workouts/workout-session.types.js";

export const exerciseSetIdSchema = ownerIdSchema;
export type ExerciseSetId = Readonly<z.infer<typeof exerciseSetIdSchema>>;

export const perceivedEffortSchema = z.strictObject({
  value: z.number().finite().min(1).max(10),
  scale: z.literal("one_to_ten"),
}).readonly();
export type PerceivedEffort = Readonly<z.infer<typeof perceivedEffortSchema>>;

export const exerciseSetSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
  id: exerciseSetIdSchema,
  workoutSessionId: workoutSessionIdSchema,
  exerciseId: exerciseIdSchema,
  sequence: sequenceSchema,
  repetitions: repetitionCountSchema.optional(),
  weight: weightValueSchema.optional(),
  duration: durationValueSchema.optional(),
  distance: distanceValueSchema.optional(),
  perceivedEffort: perceivedEffortSchema.optional(),
})
  .refine((value) => orderedInstants(value.createdAt, value.updatedAt), { message: "Update time must not be earlier than creation time.", path: ["updatedAt"] }).readonly();
export type ExerciseSet = Readonly<z.infer<typeof exerciseSetSchema>>;
