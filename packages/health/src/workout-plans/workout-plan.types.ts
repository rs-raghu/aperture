import type { EntityMetadata, IsoDateString } from "../health.types.js";

export type WorkoutPlanId = string;
export type WorkoutPlanStatus = "draft" | "active" | "archived";

export interface WorkoutPlan extends EntityMetadata {
  readonly id: WorkoutPlanId;
  readonly title: string;
  readonly status: WorkoutPlanStatus;
  readonly startsOn?: IsoDateString;
  readonly endsOn?: IsoDateString;
}
