import type { OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { CourseTopic, TopicId, TopicStatus } from "./topic.types.js";

export interface CreateTopicInput {
  readonly ownerId: OwnerId;
  readonly courseId: CourseId;
  readonly title: string;
}

export interface UpdateTopicInput {
  readonly title?: string;
  readonly status?: TopicStatus;
}

export interface TopicsByCourseQuery extends OwnerQuery {
  readonly courseId: CourseId;
  readonly status?: TopicStatus;
}

export declare function createTopic(input: CreateTopicInput): Promise<CourseTopic>;
export declare function updateTopic(id: TopicId, ownerId: OwnerId, input: UpdateTopicInput): Promise<CourseTopic>;
export declare function markTopicComplete(id: TopicId, ownerId: OwnerId): Promise<CourseTopic>;
export declare function getTopic(id: TopicId, ownerId: OwnerId): Promise<CourseTopic | null>;
export declare function listTopicsByCourse(query: TopicsByCourseQuery): Promise<PageResult<CourseTopic>>;
