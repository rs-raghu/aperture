import type { IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { HeartRateValue, HeartRateVariabilityValue } from "../health-units.types.js";
import type { RecoveryEntry, RecoveryEntryId, RecoveryRating } from "./recovery-entry.types.js";

export interface RecordRecoveryEntryInput {
  readonly ownerId: OwnerId;
  readonly observedAt: IsoDateTimeString;
  readonly energy?: RecoveryRating;
  readonly soreness?: RecoveryRating;
  readonly fatigue?: RecoveryRating;
  readonly mood?: RecoveryRating;
  readonly restingHeartRate?: HeartRateValue;
  readonly heartRateVariability?: HeartRateVariabilityValue;
}
export type UpdateRecoveryEntryInput = Partial<Omit<RecordRecoveryEntryInput, "ownerId">>;
export interface RecoveryEntryListQuery extends OwnerQuery {}

export declare function recordRecoveryEntry(input: RecordRecoveryEntryInput): Promise<RecoveryEntry>;
export declare function updateRecoveryEntry(id: RecoveryEntryId, ownerId: OwnerId, input: UpdateRecoveryEntryInput): Promise<RecoveryEntry>;
export declare function deleteRecoveryEntry(id: RecoveryEntryId, ownerId: OwnerId): Promise<void>;
export declare function getRecoveryEntry(id: RecoveryEntryId, ownerId: OwnerId): Promise<RecoveryEntry | null>;
export declare function listRecoveryEntries(query: RecoveryEntryListQuery): Promise<PageResult<RecoveryEntry>>;
