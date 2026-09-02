import type { IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../health.types.js";
import type { ExerciseId } from "../exercises/exercise.types.js";
import type { RunningActivityId } from "../running/running-activity.types.js";
import type { PersonalRecord, PersonalRecordId, PersonalRecordMetric } from "./personal-record.types.js";

export interface RecordPersonalRecordInput {
  readonly ownerId: OwnerId;
  readonly exerciseId?: ExerciseId;
  readonly runningActivityId?: RunningActivityId;
  readonly title: string;
  readonly metric: PersonalRecordMetric;
  readonly achievedAt: IsoDateTimeString;
}
export interface UpdatePersonalRecordInput {
  readonly title?: string;
  readonly metric?: PersonalRecordMetric;
  readonly achievedAt?: IsoDateTimeString;
}
export interface PersonalRecordListQuery extends OwnerQuery {
  readonly exerciseId?: ExerciseId;
}

export declare function recordPersonalRecord(input: RecordPersonalRecordInput): Promise<PersonalRecord>;
export declare function updatePersonalRecord(id: PersonalRecordId, ownerId: OwnerId, input: UpdatePersonalRecordInput): Promise<PersonalRecord>;
export declare function deletePersonalRecord(id: PersonalRecordId, ownerId: OwnerId): Promise<void>;
export declare function getPersonalRecord(id: PersonalRecordId, ownerId: OwnerId): Promise<PersonalRecord | null>;
export declare function listPersonalRecords(query: PersonalRecordListQuery): Promise<PageResult<PersonalRecord>>;
