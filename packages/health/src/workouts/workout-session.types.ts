import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";
import type { WorkoutPlanId } from "../workout-plans/workout-plan.types.js";

export type WorkoutSessionId = string;
export type WorkoutSessionStatus = "planned" | "in_progress" | "paused" | "completed" | "cancelled";

export interface WorkoutSession extends EntityMetadata {
  readonly id: WorkoutSessionId;
  readonly workoutPlanId?: WorkoutPlanId;
  readonly title: string;
  readonly status: WorkoutSessionStatus;
  readonly scheduledAt?: IsoDateTimeString;
  readonly startedAt?: IsoDateTimeString;
  readonly endedAt?: IsoDateTimeString;
}
