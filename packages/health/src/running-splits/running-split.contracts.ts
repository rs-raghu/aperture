import type { OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { DistanceValue, DurationValue } from "../health-units.types.js";
import type { RunningActivityId } from "../running/running-activity.types.js";
import type { RunningSplit, RunningSplitId } from "./running-split.types.js";

export interface RecordRunningSplitInput {
  readonly ownerId: OwnerId;
  readonly runningActivityId: RunningActivityId;
  readonly sequence: number;
  readonly distance: DistanceValue;
  readonly duration: DurationValue;
}
export interface UpdateRunningSplitInput {
  readonly sequence?: number;
  readonly distance?: DistanceValue;
  readonly duration?: DurationValue;
}
export interface RunningSplitListQuery extends OwnerQuery {
  readonly runningActivityId?: RunningActivityId;
}
export interface RunningSplitsByActivityQuery extends OwnerQuery {
  readonly runningActivityId: RunningActivityId;
}

export declare function recordRunningSplit(input: RecordRunningSplitInput): Promise<RunningSplit>;
export declare function updateRunningSplit(id: RunningSplitId, ownerId: OwnerId, input: UpdateRunningSplitInput): Promise<RunningSplit>;
export declare function deleteRunningSplit(id: RunningSplitId, ownerId: OwnerId): Promise<void>;
export declare function listRunningSplitsByActivity(query: RunningSplitsByActivityQuery): Promise<PageResult<RunningSplit>>;
