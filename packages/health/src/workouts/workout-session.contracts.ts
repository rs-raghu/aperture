import { z } from "@aperture/validation";
import { dateRangeSchema, isoDateTimeStringSchema, ownerIdSchema, pageRequestSchema } from "../health.types.js";
import { textSchema } from "../internal/primitives.js";
import { hasDefinedUpdate } from "../internal/validation.helpers.js";
import { workoutPlanIdSchema } from "../workout-plans/workout-plan.types.js";
import type { IsoDateTimeString, OwnerId, PageResult } from "../health.types.js";
import type { WorkoutSession, WorkoutSessionId } from "./workout-session.types.js";

export const createWorkoutSessionInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  workoutPlanId: workoutPlanIdSchema.optional(),
  title: textSchema,
  scheduledAt: isoDateTimeStringSchema.optional(),
}).readonly();
export type CreateWorkoutSessionInput = Readonly<z.infer<typeof createWorkoutSessionInputSchema>>;

export const updateWorkoutSessionInputSchema = z.strictObject({
  workoutPlanId: workoutPlanIdSchema.optional(),
  title: textSchema.optional(),
  scheduledAt: isoDateTimeStringSchema.optional(),
})
  .refine(hasDefinedUpdate, "At least one mutable field is required.").readonly();
export type UpdateWorkoutSessionInput = Readonly<z.infer<typeof updateWorkoutSessionInputSchema>>;

export const workoutSessionListQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
}).readonly();
export type WorkoutSessionListQuery = Readonly<z.infer<typeof workoutSessionListQuerySchema>>;

export const workoutSessionsByDateRangeQuerySchema = z.strictObject({
  ...pageRequestSchema.unwrap().shape,
  ownerId: ownerIdSchema,
  range: dateRangeSchema,
}).readonly();
export type WorkoutSessionsByDateRangeQuery = Readonly<z.infer<typeof workoutSessionsByDateRangeQuerySchema>>;

// Lifecycle operations remain declaration-only until Phase 13.
export declare function createWorkoutSession(input: CreateWorkoutSessionInput): Promise<WorkoutSession>;
export declare function startWorkout(id: WorkoutSessionId, ownerId: OwnerId, startedAt: IsoDateTimeString): Promise<WorkoutSession>;
export declare function pauseWorkout(id: WorkoutSessionId, ownerId: OwnerId, pausedAt: IsoDateTimeString): Promise<WorkoutSession>;
export declare function resumeWorkout(id: WorkoutSessionId, ownerId: OwnerId, resumedAt: IsoDateTimeString): Promise<WorkoutSession>;
export declare function completeWorkout(id: WorkoutSessionId, ownerId: OwnerId, completedAt: IsoDateTimeString): Promise<WorkoutSession>;
export declare function cancelWorkout(id: WorkoutSessionId, ownerId: OwnerId): Promise<WorkoutSession>;
export declare function getWorkoutSession(id: WorkoutSessionId, ownerId: OwnerId): Promise<WorkoutSession | null>;
export declare function listWorkoutSessions(query: WorkoutSessionListQuery): Promise<PageResult<WorkoutSession>>;
export declare function listWorkoutSessionsByDateRange(query: WorkoutSessionsByDateRangeQuery): Promise<PageResult<WorkoutSession>>;
