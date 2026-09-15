import { z } from "@aperture/validation";
import { exerciseIdSchema } from "../exercises/exercise.types.js";
import { distanceValueSchema, durationValueSchema, repetitionCountSchema, weightValueSchema } from "../health-units.types.js";
import { ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { sequenceSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { workoutSessionIdSchema } from "../workouts/workout-session.types.js";
import { perceivedEffortSchema } from "./exercise-set.types.js";

export const recordExerciseSetInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  workoutSessionId: workoutSessionIdSchema,
  exerciseId: exerciseIdSchema,
  sequence: sequenceSchema,
  repetitions: repetitionCountSchema.optional(),
  weight: weightValueSchema.optional(),
  duration: durationValueSchema.optional(),
  distance: distanceValueSchema.optional(),
  perceivedEffort: perceivedEffortSchema.optional(),
}).readonly();
export type RecordExerciseSetInput = Readonly<z.infer<typeof recordExerciseSetInputSchema>>;

export const updateExerciseSetInputSchema = z.strictObject({
  sequence: sequenceSchema.optional(),
  repetitions: repetitionCountSchema.optional(),
  weight: weightValueSchema.optional(),
  duration: durationValueSchema.optional(),
  distance: distanceValueSchema.optional(),
  perceivedEffort: perceivedEffortSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateExerciseSetInput = Readonly<z.infer<typeof updateExerciseSetInputSchema>>;

export const exerciseSetListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  workoutSessionId: workoutSessionIdSchema.optional(),
  exerciseId: exerciseIdSchema.optional(),
}).readonly();
export type ExerciseSetListQuery = Readonly<z.infer<typeof exerciseSetListQuerySchema>>;

export const exerciseSetsByWorkoutQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  workoutSessionId: workoutSessionIdSchema,
}).readonly();
export type ExerciseSetsByWorkoutQuery = Readonly<z.infer<typeof exerciseSetsByWorkoutQuerySchema>>;

export const exerciseSetsByExerciseQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  exerciseId: exerciseIdSchema,
}).readonly();
export type ExerciseSetsByExerciseQuery = Readonly<z.infer<typeof exerciseSetsByExerciseQuerySchema>>;
