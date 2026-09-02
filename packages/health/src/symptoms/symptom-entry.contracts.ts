import type { IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { SymptomEntry, SymptomEntryId, SymptomSeverity } from "./symptom-entry.types.js";

export interface RecordSymptomInput {
  readonly ownerId: OwnerId;
  readonly observation: string;
  readonly severity?: SymptomSeverity;
  readonly observedAt: IsoDateTimeString;
}
export interface UpdateSymptomEntryInput {
  readonly observation?: string;
  readonly severity?: SymptomSeverity;
  readonly observedAt?: IsoDateTimeString;
}
export interface SymptomEntryListQuery extends OwnerQuery {}

export declare function recordSymptom(input: RecordSymptomInput): Promise<SymptomEntry>;
export declare function updateSymptomEntry(id: SymptomEntryId, ownerId: OwnerId, input: UpdateSymptomEntryInput): Promise<SymptomEntry>;
export declare function deleteSymptomEntry(id: SymptomEntryId, ownerId: OwnerId): Promise<void>;
export declare function getSymptomEntry(id: SymptomEntryId, ownerId: OwnerId): Promise<SymptomEntry | null>;
export declare function listSymptomEntries(query: SymptomEntryListQuery): Promise<PageResult<SymptomEntry>>;
