import type { EntityMetadata } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";

export type TopicId = string;
export type TopicStatus = "planned" | "in_progress" | "completed";

export interface CourseTopic extends EntityMetadata {
  readonly id: TopicId;
  readonly courseId: CourseId;
  readonly title: string;
  readonly status: TopicStatus;
}
