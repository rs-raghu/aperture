import type { EntityMetadata, IsoDateTimeString } from "../health.types.js";
import type { DistanceValue, DurationValue } from "../health-units.types.js";
import type { EquipmentId } from "../equipment/equipment.types.js";
import type { ActivityRouteId } from "../routes/activity-route.types.js";
import type { WorkoutSessionId } from "../workouts/workout-session.types.js";

export type RunningActivityId = string;
export type RunningActivityStatus = "planned" | "in_progress" | "completed";

export interface RunningActivity extends EntityMetadata {
  readonly id: RunningActivityId;
  readonly workoutSessionId?: WorkoutSessionId;
  readonly routeId?: ActivityRouteId;
  readonly equipmentIds?: readonly EquipmentId[];
  readonly title: string;
  readonly status: RunningActivityStatus;
  readonly startedAt: IsoDateTimeString;
  readonly endedAt?: IsoDateTimeString;
  readonly distance?: DistanceValue;
  readonly duration?: DurationValue;
}
