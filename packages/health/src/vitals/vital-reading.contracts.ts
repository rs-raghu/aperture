import type { DateRange, IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { VitalReading, VitalReadingId, VitalReadingType, VitalReadingValue } from "./vital-reading.types.js";

export interface RecordVitalReadingInput {
  readonly ownerId: OwnerId;
  readonly reading: VitalReadingValue;
  readonly observedAt: IsoDateTimeString;
}
export interface UpdateVitalReadingInput {
  readonly reading?: VitalReadingValue;
  readonly observedAt?: IsoDateTimeString;
}
export interface VitalReadingListQuery extends OwnerQuery {
  readonly type?: VitalReadingType;
}
export interface VitalReadingsByTypeQuery extends OwnerQuery {
  readonly type: VitalReadingType;
}
export interface VitalReadingsByDateRangeQuery extends OwnerQuery {
  readonly range: DateRange;
}

export declare function recordVitalReading(input: RecordVitalReadingInput): Promise<VitalReading>;
export declare function updateVitalReading(id: VitalReadingId, ownerId: OwnerId, input: UpdateVitalReadingInput): Promise<VitalReading>;
export declare function deleteVitalReading(id: VitalReadingId, ownerId: OwnerId): Promise<void>;
export declare function getVitalReading(id: VitalReadingId, ownerId: OwnerId): Promise<VitalReading | null>;
export declare function listVitalReadings(query: VitalReadingListQuery): Promise<PageResult<VitalReading>>;
export declare function listVitalReadingsByType(query: VitalReadingsByTypeQuery): Promise<PageResult<VitalReading>>;
export declare function listVitalReadingsByDateRange(query: VitalReadingsByDateRangeQuery): Promise<PageResult<VitalReading>>;
