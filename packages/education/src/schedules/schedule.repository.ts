import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateScheduleEntryInput, ScheduleEntryListQuery, UpdateScheduleEntryInput } from "./schedule.contracts.js";
import type { ScheduleEntry, ScheduleEntryId } from "./schedule.types.js";

export interface ScheduleRepository
  extends CrudRepository<ScheduleEntry, ScheduleEntryId, CreateScheduleEntryInput, UpdateScheduleEntryInput, ScheduleEntryListQuery> {}
