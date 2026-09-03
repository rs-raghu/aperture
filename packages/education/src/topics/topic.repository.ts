import type { CrudRepository } from "../repositories/repository.types.js";
import type { CourseTopic, TopicId, TopicsByCourseQuery } from "./topic.types.js";

export interface TopicRepository
  extends CrudRepository<CourseTopic, TopicId, TopicsByCourseQuery> {}
