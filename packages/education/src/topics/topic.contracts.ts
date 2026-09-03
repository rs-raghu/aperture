import type { OwnerId, PageResult } from "../education.types.js";
import type { CourseTopic, CreateTopicInput, TopicId, TopicsByCourseQuery, UpdateTopicInput } from "./topic.types.js";
export type { CreateTopicInput, TopicsByCourseQuery, UpdateTopicInput } from "./topic.types.js";
export declare function createTopic(input: CreateTopicInput): Promise<CourseTopic>;
export declare function updateTopic(id: TopicId, ownerId: OwnerId, input: UpdateTopicInput): Promise<CourseTopic>;
export declare function markTopicComplete(id: TopicId, ownerId: OwnerId): Promise<CourseTopic>;
export declare function getTopic(id: TopicId, ownerId: OwnerId): Promise<CourseTopic | null>;
export declare function listTopicsByCourse(query: TopicsByCourseQuery): Promise<PageResult<CourseTopic>>;
