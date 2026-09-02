import type { EntityMetadata } from "../health.types.js";
import type { DistanceValue } from "../health-units.types.js";

export type ActivityRouteId = string;

export interface ActivityRoute extends EntityMetadata {
  readonly id: ActivityRouteId;
  readonly title: string;
  readonly distance?: DistanceValue;
}
