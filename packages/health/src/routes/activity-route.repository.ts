import type { CrudRepository } from "../repositories/repository.types.js";
import type { ActivityRouteListQuery, CreateActivityRouteInput, UpdateActivityRouteInput } from "./activity-route.contracts.js";
import type { ActivityRoute, ActivityRouteId } from "./activity-route.types.js";

export interface ActivityRouteRepository
  extends CrudRepository<ActivityRoute, ActivityRouteId, CreateActivityRouteInput, UpdateActivityRouteInput, ActivityRouteListQuery> {}
