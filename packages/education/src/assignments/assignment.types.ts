import type { EntityMetadata, IsoDateTimeString } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { TopicId } from "../topics/topic.types.js";

export type AssignmentId = string;
export type AssignmentStatus = "draft" | "assigned" | "submitted" | "completed";

export interface Assignment extends EntityMetadata {
  readonly id: AssignmentId;
  readonly courseId: CourseId;
  readonly topicId?: TopicId;
  readonly title: string;
  readonly status: AssignmentStatus;
  readonly dueAt?: IsoDateTimeString;
  readonly submittedAt?: IsoDateTimeString;
}
