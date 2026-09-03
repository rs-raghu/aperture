import type {
  CreateResult,
  DeleteResult,
  RepositoryContext,
  UpdateResult
} from "./data-access.types.js";

export interface MutationContract<Entity, CreateInput, UpdateInput> {
  create(input: CreateInput, context: RepositoryContext): Promise<CreateResult<Entity>>;
  update(id: string, input: UpdateInput, context: RepositoryContext): Promise<UpdateResult<Entity>>;
  delete(id: string, context: RepositoryContext): Promise<DeleteResult>;
}
