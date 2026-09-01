import type { EntityMetadata, IsoDateTimeString } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { TopicId } from "../topics/topic.types.js";

export type StudySessionId = string;
export type StudySessionStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export interface StudySession extends EntityMetadata {
  readonly id: StudySessionId;
  readonly courseId?: CourseId;
  readonly topicId?: TopicId;
  readonly title: string;
  readonly status: StudySessionStatus;
  readonly startsAt: IsoDateTimeString;
  readonly endsAt?: IsoDateTimeString;
}
