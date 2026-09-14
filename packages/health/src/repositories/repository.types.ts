import { ownerQuerySchema } from "../health.types.js";
import type { OwnerId, OwnerQuery, PageResult } from "../health.types.js";

export const repositoryFilterSchema = ownerQuerySchema;
export type RepositoryFilter = OwnerQuery;

export interface ReadRepository<TEntity, TId, TFilter extends RepositoryFilter> {
  findById(id: TId, ownerId: OwnerId): Promise<TEntity | null>;
  findMany(filter: TFilter): Promise<PageResult<TEntity>>;
}

export interface WriteRepository<TEntity, TId, TCreateInput, TUpdateInput> {
  create(input: TCreateInput): Promise<TEntity>;
  update(id: TId, ownerId: OwnerId, input: TUpdateInput): Promise<TEntity>;
  delete(id: TId, ownerId: OwnerId): Promise<void>;
}

export interface CrudRepository<TEntity, TId, TCreateInput, TUpdateInput, TFilter extends RepositoryFilter>
  extends ReadRepository<TEntity, TId, TFilter>,
    WriteRepository<TEntity, TId, TCreateInput, TUpdateInput> {}
