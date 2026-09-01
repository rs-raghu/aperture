import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateResourceInput, ResourcesByCourseQuery, UpdateResourceInput } from "./resource.contracts.js";
import type { LearningResource, ResourceId } from "./resource.types.js";

export interface ResourceRepository
  extends CrudRepository<LearningResource, ResourceId, CreateResourceInput, UpdateResourceInput, ResourcesByCourseQuery> {
  archive(id: ResourceId, ownerId: string): Promise<LearningResource>;
}
