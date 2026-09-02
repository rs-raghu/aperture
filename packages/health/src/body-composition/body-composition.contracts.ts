import type { IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { DistanceValue, HeightValue, PercentageValue, WeightValue } from "../health-units.types.js";
import type { BodyCompositionRecord, BodyCompositionRecordId } from "./body-composition.types.js";

export interface RecordBodyCompositionInput {
  readonly ownerId: OwnerId;
  readonly observedAt: IsoDateTimeString;
  readonly weight?: WeightValue;
  readonly height?: HeightValue;
  readonly bodyFat?: PercentageValue;
  readonly waist?: DistanceValue;
  readonly hip?: DistanceValue;
  readonly muscleMass?: WeightValue;
}
export type UpdateBodyCompositionInput = Omit<RecordBodyCompositionInput, "ownerId">;
export interface BodyCompositionListQuery extends OwnerQuery {}

export declare function recordBodyComposition(input: RecordBodyCompositionInput): Promise<BodyCompositionRecord>;
export declare function updateBodyComposition(id: BodyCompositionRecordId, ownerId: OwnerId, input: UpdateBodyCompositionInput): Promise<BodyCompositionRecord>;
export declare function deleteBodyComposition(id: BodyCompositionRecordId, ownerId: OwnerId): Promise<void>;
export declare function getBodyComposition(id: BodyCompositionRecordId, ownerId: OwnerId): Promise<BodyCompositionRecord | null>;
export declare function listBodyCompositionRecords(query: BodyCompositionListQuery): Promise<PageResult<BodyCompositionRecord>>;
