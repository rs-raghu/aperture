import type { IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { LaboratoryResult, LaboratoryResultId, LaboratoryResultValue } from "./laboratory-result.types.js";

export interface RecordLaboratoryResultInput {
  readonly ownerId: OwnerId;
  readonly testName: string;
  readonly result: LaboratoryResultValue;
  readonly collectedAt: IsoDateTimeString;
}
export interface UpdateLaboratoryResultInput {
  readonly testName?: string;
  readonly result?: LaboratoryResultValue;
  readonly collectedAt?: IsoDateTimeString;
}
export interface LaboratoryResultListQuery extends OwnerQuery {}

export declare function recordLaboratoryResult(input: RecordLaboratoryResultInput): Promise<LaboratoryResult>;
export declare function updateLaboratoryResult(id: LaboratoryResultId, ownerId: OwnerId, input: UpdateLaboratoryResultInput): Promise<LaboratoryResult>;
export declare function deleteLaboratoryResult(id: LaboratoryResultId, ownerId: OwnerId): Promise<void>;
export declare function getLaboratoryResult(id: LaboratoryResultId, ownerId: OwnerId): Promise<LaboratoryResult | null>;
export declare function listLaboratoryResults(query: LaboratoryResultListQuery): Promise<PageResult<LaboratoryResult>>;
