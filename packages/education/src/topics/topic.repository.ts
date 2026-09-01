import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateTopicInput, TopicsByCourseQuery, UpdateTopicInput } from "./topic.contracts.js";
import type { CourseTopic, TopicId } from "./topic.types.js";

export interface TopicRepository
  extends CrudRepository<CourseTopic, TopicId, CreateTopicInput, UpdateTopicInput, TopicsByCourseQuery> {
  markComplete(id: TopicId, ownerId: string): Promise<CourseTopic>;
}
