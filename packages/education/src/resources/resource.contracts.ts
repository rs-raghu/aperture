import type { OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { CourseId } from "../courses/course.types.js";
import type { TopicId } from "../topics/topic.types.js";
import type { LearningResource, ResourceId, ResourceKind, ResourceStatus } from "./resource.types.js";

export interface CreateResourceInput {
  readonly ownerId: OwnerId;
  readonly courseId: CourseId;
  readonly topicId?: TopicId;
  readonly title: string;
  readonly kind: ResourceKind;
}

export interface UpdateResourceInput {
  readonly topicId?: TopicId;
  readonly title?: string;
  readonly kind?: ResourceKind;
  readonly status?: ResourceStatus;
}

export interface ResourcesByCourseQuery extends OwnerQuery {
  readonly courseId: CourseId;
  readonly topicId?: TopicId;
  readonly status?: ResourceStatus;
}

export declare function createResource(input: CreateResourceInput): Promise<LearningResource>;
export declare function updateResource(id: ResourceId, ownerId: OwnerId, input: UpdateResourceInput): Promise<LearningResource>;
export declare function archiveResource(id: ResourceId, ownerId: OwnerId): Promise<LearningResource>;
export declare function getResource(id: ResourceId, ownerId: OwnerId): Promise<LearningResource | null>;
export declare function listResourcesByCourse(query: ResourcesByCourseQuery): Promise<PageResult<LearningResource>>;
