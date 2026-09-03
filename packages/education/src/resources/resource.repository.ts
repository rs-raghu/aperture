import type { CrudRepository } from "../repositories/repository.types.js";
import type { LearningResource, ResourceId, ResourcesByCourseQuery } from "./resource.types.js";

export interface ResourceRepository
  extends CrudRepository<LearningResource, ResourceId, ResourcesByCourseQuery> {}
