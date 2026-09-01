import type { IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { ScheduleEntry, ScheduleEntryId, ScheduleEntryStatus } from "./schedule.types.js";

export interface CreateScheduleEntryInput {
  readonly ownerId: OwnerId;
  readonly courseId?: CourseId;
  readonly title: string;
  readonly startsAt: IsoDateTimeString;
  readonly endsAt: IsoDateTimeString;
}

export interface UpdateScheduleEntryInput {
  readonly courseId?: CourseId;
  readonly title?: string;
  readonly status?: ScheduleEntryStatus;
  readonly startsAt?: IsoDateTimeString;
  readonly endsAt?: IsoDateTimeString;
}

export interface ScheduleEntryListQuery extends OwnerQuery {
  readonly courseId?: CourseId;
  readonly status?: ScheduleEntryStatus;
  readonly startsBefore?: IsoDateTimeString;
  readonly endsAfter?: IsoDateTimeString;
}

export declare function createScheduleEntry(input: CreateScheduleEntryInput): Promise<ScheduleEntry>;
export declare function updateScheduleEntry(id: ScheduleEntryId, ownerId: OwnerId, input: UpdateScheduleEntryInput): Promise<ScheduleEntry>;
export declare function deleteScheduleEntry(id: ScheduleEntryId, ownerId: OwnerId): Promise<void>;
export declare function getScheduleEntry(id: ScheduleEntryId, ownerId: OwnerId): Promise<ScheduleEntry | null>;
export declare function listScheduleEntries(query: ScheduleEntryListQuery): Promise<PageResult<ScheduleEntry>>;
