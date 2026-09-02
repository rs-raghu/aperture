import type { EntityMetadata } from "../health.types.js";
import type { DistanceValue, DurationValue } from "../health-units.types.js";
import type { RunningActivityId } from "../running/running-activity.types.js";

export type RunningSplitId = string;

export interface RunningSplit extends EntityMetadata {
  readonly id: RunningSplitId;
  readonly runningActivityId: RunningActivityId;
  readonly sequence: number;
  readonly distance: DistanceValue;
  readonly duration: DurationValue;
}
