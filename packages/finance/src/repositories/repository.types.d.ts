import type { OwnerId, PageRequest, PageResult } from "../finance.types.js";

export interface RepositoryFilter extends PageRequest {
  readonly ownerId: OwnerId;
}

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
