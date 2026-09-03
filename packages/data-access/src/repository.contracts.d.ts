import type { RepositoryContext } from "./data-access.types.js";
import type { PaginatedResult, PaginationRequest } from "./pagination.contracts.js";
import type { QuerySpecification } from "./query.contracts.js";

export interface RepositoryContract<Entity, CreateInput, UpdateInput> {
  findById(id: string, context: RepositoryContext): Promise<Entity | null>;
  findMany(
    query: QuerySpecification & PaginationRequest,
    context: RepositoryContext
  ): Promise<PaginatedResult<Entity>>;
  create(input: CreateInput, context: RepositoryContext): Promise<Entity>;
  update(id: string, input: UpdateInput, context: RepositoryContext): Promise<Entity>;
  delete(id: string, context: RepositoryContext): Promise<void>;
}
