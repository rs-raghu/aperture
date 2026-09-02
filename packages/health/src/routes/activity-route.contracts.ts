import type { OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { DistanceValue } from "../health-units.types.js";
import type { ActivityRoute, ActivityRouteId } from "./activity-route.types.js";

export interface CreateActivityRouteInput {
  readonly ownerId: OwnerId;
  readonly title: string;
  readonly distance?: DistanceValue;
}
export interface UpdateActivityRouteInput {
  readonly title?: string;
  readonly distance?: DistanceValue;
}
export interface ActivityRouteListQuery extends OwnerQuery {}

export declare function createActivityRoute(input: CreateActivityRouteInput): Promise<ActivityRoute>;
export declare function updateActivityRoute(id: ActivityRouteId, ownerId: OwnerId, input: UpdateActivityRouteInput): Promise<ActivityRoute>;
export declare function deleteActivityRoute(id: ActivityRouteId, ownerId: OwnerId): Promise<void>;
export declare function getActivityRoute(id: ActivityRouteId, ownerId: OwnerId): Promise<ActivityRoute | null>;
export declare function listActivityRoutes(query: ActivityRouteListQuery): Promise<PageResult<ActivityRoute>>;
