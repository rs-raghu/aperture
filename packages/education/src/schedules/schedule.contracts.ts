import type { OwnerId, PageResult } from "../education.types.js";
import type { CreateScheduleEntryInput, ScheduleEntry, ScheduleEntryId, ScheduleEntryListQuery, UpdateScheduleEntryInput } from "./schedule.types.js";
export type { CreateScheduleEntryInput, ScheduleEntryListQuery, UpdateScheduleEntryInput } from "./schedule.types.js";
export declare function createScheduleEntry(input: CreateScheduleEntryInput): Promise<ScheduleEntry>;
export declare function updateScheduleEntry(id: ScheduleEntryId, ownerId: OwnerId, input: UpdateScheduleEntryInput): Promise<ScheduleEntry>;
export declare function deleteScheduleEntry(id: ScheduleEntryId, ownerId: OwnerId): Promise<void>;
export declare function getScheduleEntry(id: ScheduleEntryId, ownerId: OwnerId): Promise<ScheduleEntry | null>;
export declare function listScheduleEntries(query: ScheduleEntryListQuery): Promise<PageResult<ScheduleEntry>>;
