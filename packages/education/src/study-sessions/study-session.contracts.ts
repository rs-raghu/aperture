import type { IsoDateTimeString, OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { TopicId } from "../topics/topic.types.js";
import type { StudySession, StudySessionId, StudySessionStatus } from "./study-session.types.js";

export interface ScheduleStudySessionInput {
  readonly ownerId: OwnerId;
  readonly courseId?: CourseId;
  readonly topicId?: TopicId;
  readonly title: string;
  readonly startsAt: IsoDateTimeString;
  readonly endsAt?: IsoDateTimeString;
}

export interface UpdateStudySessionInput {
  readonly title?: string;
  readonly startsAt?: IsoDateTimeString;
  readonly endsAt?: IsoDateTimeString;
  readonly status?: StudySessionStatus;
}

export interface StudySessionListQuery extends OwnerQuery {
  readonly courseId?: CourseId;
  readonly status?: StudySessionStatus;
}

export interface StudySessionsByCourseQuery extends OwnerQuery {
  readonly courseId: CourseId;
}

export declare function scheduleStudySession(input: ScheduleStudySessionInput): Promise<StudySession>;
export declare function startStudySession(id: StudySessionId, ownerId: OwnerId, startedAt: IsoDateTimeString): Promise<StudySession>;
export declare function completeStudySession(id: StudySessionId, ownerId: OwnerId, completedAt: IsoDateTimeString): Promise<StudySession>;
export declare function cancelStudySession(id: StudySessionId, ownerId: OwnerId): Promise<StudySession>;
export declare function getStudySession(id: StudySessionId, ownerId: OwnerId): Promise<StudySession | null>;
export declare function listStudySessions(query: StudySessionListQuery): Promise<PageResult<StudySession>>;
export declare function listStudySessionsByCourse(query: StudySessionsByCourseQuery): Promise<PageResult<StudySession>>;
