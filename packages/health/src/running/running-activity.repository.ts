import type { CrudRepository } from "../repositories/repository.types.js";
import type { RunningActivityListQuery } from "./running-activity.contracts.js";
import type { RunningActivity, RunningActivityId } from "./running-activity.types.js";

export interface RunningActivityRepository
  extends CrudRepository<RunningActivity, RunningActivityId, RunningActivityListQuery> {}
