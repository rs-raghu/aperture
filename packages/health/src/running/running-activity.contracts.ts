import type { DateRange, IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { DistanceValue, DurationValue } from "../health-units.types.js";
import type { EquipmentId } from "../equipment/equipment.types.js";
import type { ActivityRouteId } from "../routes/activity-route.types.js";
import type { WorkoutSessionId } from "../workouts/workout-session.types.js";
import type { RunningActivity, RunningActivityId } from "./running-activity.types.js";

export interface CreateRunningActivityInput {
  readonly ownerId: OwnerId;
  readonly workoutSessionId?: WorkoutSessionId;
  readonly routeId?: ActivityRouteId;
  readonly equipmentIds?: readonly EquipmentId[];
  readonly title: string;
  readonly startedAt: IsoDateTimeString;
}
export interface UpdateRunningActivityInput {
  readonly routeId?: ActivityRouteId;
  readonly equipmentIds?: readonly EquipmentId[];
  readonly title?: string;
  readonly startedAt?: IsoDateTimeString;
  readonly endedAt?: IsoDateTimeString;
  readonly distance?: DistanceValue;
  readonly duration?: DurationValue;
}
export interface RunningActivityListQuery extends OwnerQuery {}
export interface RunningActivitiesByDateRangeQuery extends OwnerQuery {
  readonly range: DateRange;
}

export declare function createRunningActivity(input: CreateRunningActivityInput): Promise<RunningActivity>;
export declare function updateRunningActivity(id: RunningActivityId, ownerId: OwnerId, input: UpdateRunningActivityInput): Promise<RunningActivity>;
export declare function completeRunningActivity(id: RunningActivityId, ownerId: OwnerId, completedAt: IsoDateTimeString): Promise<RunningActivity>;
export declare function deleteRunningActivity(id: RunningActivityId, ownerId: OwnerId): Promise<void>;
export declare function getRunningActivity(id: RunningActivityId, ownerId: OwnerId): Promise<RunningActivity | null>;
export declare function listRunningActivities(query: RunningActivityListQuery): Promise<PageResult<RunningActivity>>;
export declare function listRunningActivitiesByDateRange(query: RunningActivitiesByDateRangeQuery): Promise<PageResult<RunningActivity>>;
