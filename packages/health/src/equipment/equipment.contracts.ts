import type { IsoDateString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { DistanceValue, DurationValue } from "../health-units.types.js";
import type { RunningActivityId } from "../running/running-activity.types.js";
import type { WorkoutSessionId } from "../workouts/workout-session.types.js";
import type { Equipment, EquipmentCategory, EquipmentId, EquipmentStatus, EquipmentUsageSummary } from "./equipment.types.js";

export interface CreateEquipmentInput {
  readonly ownerId: OwnerId;
  readonly name: string;
  readonly category: EquipmentCategory;
  readonly acquiredOn?: IsoDateString;
}
export interface UpdateEquipmentInput {
  readonly name?: string;
  readonly category?: EquipmentCategory;
  readonly status?: EquipmentStatus;
  readonly acquiredOn?: IsoDateString;
}
export interface EquipmentListQuery extends OwnerQuery {
  readonly category?: EquipmentCategory;
  readonly status?: EquipmentStatus;
}
export interface RecordEquipmentUsageInput {
  readonly equipmentId: EquipmentId;
  readonly ownerId: OwnerId;
  readonly workoutSessionId?: WorkoutSessionId;
  readonly runningActivityId?: RunningActivityId;
  readonly distance?: DistanceValue;
  readonly duration?: DurationValue;
}

export declare function createEquipment(input: CreateEquipmentInput): Promise<Equipment>;
export declare function updateEquipment(id: EquipmentId, ownerId: OwnerId, input: UpdateEquipmentInput): Promise<Equipment>;
export declare function retireEquipment(id: EquipmentId, ownerId: OwnerId): Promise<Equipment>;
export declare function getEquipment(id: EquipmentId, ownerId: OwnerId): Promise<Equipment | null>;
export declare function listEquipment(query: EquipmentListQuery): Promise<PageResult<Equipment>>;
export declare function recordEquipmentUsage(input: RecordEquipmentUsageInput): Promise<EquipmentUsageSummary>;
export declare function getEquipmentUsageSummary(id: EquipmentId, ownerId: OwnerId): Promise<EquipmentUsageSummary>;
