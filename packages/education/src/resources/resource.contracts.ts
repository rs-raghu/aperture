import type { OwnerId, PageResult } from "../education.types.js";
import type { CreateResourceInput, LearningResource, ResourceId, ResourcesByCourseQuery, UpdateResourceInput } from "./resource.types.js";
export type { CreateResourceInput, ResourcesByCourseQuery, UpdateResourceInput } from "./resource.types.js";
export declare function createResource(input: CreateResourceInput): Promise<LearningResource>;
export declare function updateResource(id: ResourceId, ownerId: OwnerId, input: UpdateResourceInput): Promise<LearningResource>;
export declare function archiveResource(id: ResourceId, ownerId: OwnerId): Promise<LearningResource>;
export declare function getResource(id: ResourceId, ownerId: OwnerId): Promise<LearningResource | null>;
export declare function listResourcesByCourse(query: ResourcesByCourseQuery): Promise<PageResult<LearningResource>>;
