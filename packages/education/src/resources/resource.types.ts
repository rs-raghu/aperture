import type { EntityMetadata } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { TopicId } from "../topics/topic.types.js";

export type ResourceId = string;
export type ResourceKind = "book" | "article" | "video" | "document" | "link" | "other";
export type ResourceStatus = "active" | "archived";

export interface LearningResource extends EntityMetadata {
  readonly id: ResourceId;
  readonly courseId: CourseId;
  readonly topicId?: TopicId;
  readonly title: string;
  readonly kind: ResourceKind;
  readonly status: ResourceStatus;
}
