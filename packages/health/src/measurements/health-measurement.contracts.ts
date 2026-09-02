import type { DateRange, IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type {
  HealthMeasurement,
  HealthMeasurementId,
  HealthMeasurementType,
  HealthMeasurementValue,
} from "./health-measurement.types.js";

export interface RecordHealthMeasurementInput {
  readonly ownerId: OwnerId;
  readonly type: HealthMeasurementType;
  readonly measurement: HealthMeasurementValue;
  readonly observedAt: IsoDateTimeString;
}
export interface UpdateHealthMeasurementInput {
  readonly measurement?: HealthMeasurementValue;
  readonly observedAt?: IsoDateTimeString;
}
export interface HealthMeasurementListQuery extends OwnerQuery {
  readonly type?: HealthMeasurementType;
}
export interface HealthMeasurementsByTypeQuery extends OwnerQuery {
  readonly type: HealthMeasurementType;
}
export interface HealthMeasurementsByDateRangeQuery extends OwnerQuery {
  readonly range: DateRange;
}

export declare function recordHealthMeasurement(input: RecordHealthMeasurementInput): Promise<HealthMeasurement>;
export declare function updateHealthMeasurement(id: HealthMeasurementId, ownerId: OwnerId, input: UpdateHealthMeasurementInput): Promise<HealthMeasurement>;
export declare function deleteHealthMeasurement(id: HealthMeasurementId, ownerId: OwnerId): Promise<void>;
export declare function getHealthMeasurement(id: HealthMeasurementId, ownerId: OwnerId): Promise<HealthMeasurement | null>;
export declare function listHealthMeasurements(query: HealthMeasurementListQuery): Promise<PageResult<HealthMeasurement>>;
export declare function listHealthMeasurementsByType(query: HealthMeasurementsByTypeQuery): Promise<PageResult<HealthMeasurement>>;
export declare function listHealthMeasurementsByDateRange(query: HealthMeasurementsByDateRangeQuery): Promise<PageResult<HealthMeasurement>>;
