import { ownerQuerySchema } from "../health.types.js";
import type { OwnerId, OwnerQuery, PageResult } from "../health.types.js";

export const repositoryFilterSchema = ownerQuerySchema;
export type RepositoryFilter = OwnerQuery;

export interface ReadRepository<TEntity, TId, TFilter extends RepositoryFilter> {
  findById(id: TId, ownerId: OwnerId): Promise<TEntity | null>;
  findMany(filter: TFilter): Promise<PageResult<TEntity>>;
}

export interface WriteRepository<TEntity, TId> {
  create(entity: TEntity): Promise<TEntity>;
  update(entity: TEntity): Promise<TEntity>;
  delete(id: TId, ownerId: OwnerId): Promise<void>;
}

export interface CrudRepository<TEntity, TId, TFilter extends RepositoryFilter>
  extends ReadRepository<TEntity, TId, TFilter>,
    WriteRepository<TEntity, TId> {}
