import type { IsoDateString, IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { HydrationVolumeValue } from "../health-units.types.js";
import type { HydrationEntry, HydrationEntryId } from "./hydration-entry.types.js";

export interface RecordHydrationInput {
  readonly ownerId: OwnerId;
  readonly volume: HydrationVolumeValue;
  readonly consumedAt: IsoDateTimeString;
}
export interface UpdateHydrationEntryInput {
  readonly volume?: HydrationVolumeValue;
  readonly consumedAt?: IsoDateTimeString;
}
export interface HydrationEntryListQuery extends OwnerQuery {}
export interface HydrationEntriesByDateQuery extends OwnerQuery {
  readonly date: IsoDateString;
}

export declare function recordHydration(input: RecordHydrationInput): Promise<HydrationEntry>;
export declare function updateHydrationEntry(id: HydrationEntryId, ownerId: OwnerId, input: UpdateHydrationEntryInput): Promise<HydrationEntry>;
export declare function deleteHydrationEntry(id: HydrationEntryId, ownerId: OwnerId): Promise<void>;
export declare function getHydrationEntry(id: HydrationEntryId, ownerId: OwnerId): Promise<HydrationEntry | null>;
export declare function listHydrationEntries(query: HydrationEntryListQuery): Promise<PageResult<HydrationEntry>>;
export declare function listHydrationEntriesByDate(query: HydrationEntriesByDateQuery): Promise<PageResult<HydrationEntry>>;
