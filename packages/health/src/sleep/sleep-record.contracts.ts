import type { DateRange, IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { DurationValue } from "../health-units.types.js";
import type { SleepQuality, SleepRecord, SleepRecordId } from "./sleep-record.types.js";

export interface RecordSleepInput {
  readonly ownerId: OwnerId;
  readonly startedAt: IsoDateTimeString;
  readonly endedAt: IsoDateTimeString;
  readonly duration?: DurationValue;
  readonly quality?: SleepQuality;
}
export interface UpdateSleepInput {
  readonly startedAt?: IsoDateTimeString;
  readonly endedAt?: IsoDateTimeString;
  readonly duration?: DurationValue;
  readonly quality?: SleepQuality;
}
export interface SleepRecordListQuery extends OwnerQuery {}
export interface SleepRecordsByDateRangeQuery extends OwnerQuery {
  readonly range: DateRange;
}

export declare function recordSleep(input: RecordSleepInput): Promise<SleepRecord>;
export declare function updateSleep(id: SleepRecordId, ownerId: OwnerId, input: UpdateSleepInput): Promise<SleepRecord>;
export declare function deleteSleep(id: SleepRecordId, ownerId: OwnerId): Promise<void>;
export declare function getSleepRecord(id: SleepRecordId, ownerId: OwnerId): Promise<SleepRecord | null>;
export declare function listSleepRecords(query: SleepRecordListQuery): Promise<PageResult<SleepRecord>>;
export declare function listSleepRecordsByDateRange(query: SleepRecordsByDateRangeQuery): Promise<PageResult<SleepRecord>>;
