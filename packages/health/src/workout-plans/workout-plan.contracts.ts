import type { IsoDateString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { WorkoutPlan, WorkoutPlanId, WorkoutPlanStatus } from "./workout-plan.types.js";

export interface CreateWorkoutPlanInput {
  readonly ownerId: OwnerId;
  readonly title: string;
  readonly startsOn?: IsoDateString;
  readonly endsOn?: IsoDateString;
}
export interface UpdateWorkoutPlanInput {
  readonly title?: string;
  readonly status?: WorkoutPlanStatus;
  readonly startsOn?: IsoDateString;
  readonly endsOn?: IsoDateString;
}
export interface WorkoutPlanListQuery extends OwnerQuery {
  readonly status?: WorkoutPlanStatus;
}

export declare function createWorkoutPlan(input: CreateWorkoutPlanInput): Promise<WorkoutPlan>;
export declare function updateWorkoutPlan(id: WorkoutPlanId, ownerId: OwnerId, input: UpdateWorkoutPlanInput): Promise<WorkoutPlan>;
export declare function archiveWorkoutPlan(id: WorkoutPlanId, ownerId: OwnerId): Promise<WorkoutPlan>;
export declare function activateWorkoutPlan(id: WorkoutPlanId, ownerId: OwnerId): Promise<WorkoutPlan>;
export declare function getWorkoutPlan(id: WorkoutPlanId, ownerId: OwnerId): Promise<WorkoutPlan | null>;
export declare function listWorkoutPlans(query: WorkoutPlanListQuery): Promise<PageResult<WorkoutPlan>>;
