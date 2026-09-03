import type { CrudRepository } from "../repositories/repository.types.js";
import type { ScheduleEntry, ScheduleEntryId, ScheduleEntryListQuery } from "./schedule.types.js";

export interface ScheduleRepository
  extends CrudRepository<ScheduleEntry, ScheduleEntryId, ScheduleEntryListQuery> {}
