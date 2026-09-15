import type { CrudRepository } from "../repositories/repository.types.js";
import type { SleepRecordListQuery } from "./sleep-record.contracts.js";
import type { SleepRecord, SleepRecordId } from "./sleep-record.types.js";

export interface SleepRecordRepository
  extends CrudRepository<SleepRecord, SleepRecordId, SleepRecordListQuery> {}
