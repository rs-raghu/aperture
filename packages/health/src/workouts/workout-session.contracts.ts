import type { DateRange, IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { WorkoutPlanId } from "../workout-plans/workout-plan.types.js";
import type { WorkoutSession, WorkoutSessionId } from "./workout-session.types.js";

export interface CreateWorkoutSessionInput {
  readonly ownerId: OwnerId;
  readonly workoutPlanId?: WorkoutPlanId;
  readonly title: string;
  readonly scheduledAt?: IsoDateTimeString;
}
export interface UpdateWorkoutSessionInput {
  readonly workoutPlanId?: WorkoutPlanId;
  readonly title?: string;
  readonly scheduledAt?: IsoDateTimeString;
}
export interface WorkoutSessionListQuery extends OwnerQuery {}
export interface WorkoutSessionsByDateRangeQuery extends OwnerQuery {
  readonly range: DateRange;
}

export declare function createWorkoutSession(input: CreateWorkoutSessionInput): Promise<WorkoutSession>;
export declare function startWorkout(id: WorkoutSessionId, ownerId: OwnerId, startedAt: IsoDateTimeString): Promise<WorkoutSession>;
export declare function pauseWorkout(id: WorkoutSessionId, ownerId: OwnerId, pausedAt: IsoDateTimeString): Promise<WorkoutSession>;
export declare function resumeWorkout(id: WorkoutSessionId, ownerId: OwnerId, resumedAt: IsoDateTimeString): Promise<WorkoutSession>;
export declare function completeWorkout(id: WorkoutSessionId, ownerId: OwnerId, completedAt: IsoDateTimeString): Promise<WorkoutSession>;
export declare function cancelWorkout(id: WorkoutSessionId, ownerId: OwnerId): Promise<WorkoutSession>;
export declare function getWorkoutSession(id: WorkoutSessionId, ownerId: OwnerId): Promise<WorkoutSession | null>;
export declare function listWorkoutSessions(query: WorkoutSessionListQuery): Promise<PageResult<WorkoutSession>>;
export declare function listWorkoutSessionsByDateRange(query: WorkoutSessionsByDateRangeQuery): Promise<PageResult<WorkoutSession>>;
