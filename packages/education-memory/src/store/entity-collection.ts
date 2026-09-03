import type { OwnerId, PageResult, SortDirection } from "@aperture/education";

import { EducationMemoryRepositoryError } from "../education-memory.errors.js";
import { cloneValue } from "./cloning.js";

export interface MemoryEntity {
  readonly id: string;
  readonly ownerId: OwnerId;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface MemoryQuery {
  readonly ownerId: OwnerId;
  readonly cursor?: string | undefined;
  readonly limit?: number | undefined;
  readonly sortDirection?: SortDirection | undefined;
}

export type EntityMatcher<TEntity, TQuery> = (
  entity: TEntity,
  query: TQuery,
) => boolean;

export type EntityComparator<TEntity> = (left: TEntity, right: TEntity) => number;

const CURSOR_PATTERN = /^memory:(0|[1-9]\d*)$/;

function compareIds(left: MemoryEntity, right: MemoryEntity): number {
  return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
}

function readOffset(cursor: string | undefined): number {
  if (cursor === undefined) return 0;
  const match = CURSOR_PATTERN.exec(cursor);
  const offset = match === null ? Number.NaN : Number(match[1]);
  if (!Number.isSafeInteger(offset) || offset < 0) {
    throw new EducationMemoryRepositoryError(
      "education-memory-invalid-query",
      "The pagination cursor is invalid for the memory adapter.",
      { field: "cursor" },
    );
  }
  return offset;
}

function readLimit(limit: number | undefined): number | undefined {
  if (limit === undefined) return undefined;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new EducationMemoryRepositoryError(
      "education-memory-invalid-query",
      "The pagination limit must be an integer from 1 through 100.",
      { field: "limit" },
    );
  }
  return limit;
}

export class EntityCollection<TEntity extends MemoryEntity> {
  readonly #records = new Map<string, TEntity>();

  public constructor(private readonly cloneValues: boolean) {}

  public async create(entity: TEntity): Promise<TEntity> {
    if (this.#records.has(entity.id)) {
      throw new EducationMemoryRepositoryError(
        "education-memory-duplicate-id",
        "A record with the supplied identifier already exists.",
        { entityId: entity.id },
      );
    }
    const stored = cloneValue(entity, this.cloneValues);
    this.#records.set(entity.id, stored);
    return cloneValue(stored, this.cloneValues);
  }

  public async update(entity: TEntity): Promise<TEntity> {
    const existing = this.#records.get(entity.id);
    if (existing === undefined || existing.ownerId !== entity.ownerId) {
      throw new EducationMemoryRepositoryError(
        "education-memory-record-not-found",
        "The requested record is unavailable.",
        { entityId: entity.id },
      );
    }
    if (existing.createdAt !== entity.createdAt) {
      throw new EducationMemoryRepositoryError(
        "education-memory-immutable-identity",
        "The record creation timestamp cannot be changed.",
        { entityId: entity.id, field: "createdAt" },
      );
    }
    const stored = cloneValue(entity, this.cloneValues);
    this.#records.set(entity.id, stored);
    return cloneValue(stored, this.cloneValues);
  }

  public async delete(id: string, ownerId: OwnerId): Promise<void> {
    const existing = this.#records.get(id);
    if (existing === undefined || existing.ownerId !== ownerId) {
      throw new EducationMemoryRepositoryError(
        "education-memory-record-not-found",
        "The requested record is unavailable.",
        { entityId: id },
      );
    }
    this.#records.delete(id);
  }

  public async findById(id: string, ownerId: OwnerId): Promise<TEntity | null> {
    const entity = this.#records.get(id);
    return entity === undefined || entity.ownerId !== ownerId
      ? null
      : cloneValue(entity, this.cloneValues);
  }

  public async findFirst(
    ownerId: OwnerId,
    predicate: (entity: TEntity) => boolean,
  ): Promise<TEntity | null> {
    const entity = [...this.#records.values()]
      .filter((candidate) => candidate.ownerId === ownerId && predicate(candidate))
      .sort(compareIds)[0];
    return entity === undefined ? null : cloneValue(entity, this.cloneValues);
  }

  public async findMany<TQuery extends MemoryQuery>(
    query: TQuery,
    matches: EntityMatcher<TEntity, TQuery>,
    compare: EntityComparator<TEntity>,
  ): Promise<PageResult<TEntity>> {
    const limit = readLimit(query.limit);
    const offset = readOffset(query.cursor);
    const direction = query.sortDirection === "descending" ? -1 : 1;
    const filtered = [...this.#records.values()]
      .filter((entity) => entity.ownerId === query.ownerId && matches(entity, query))
      .sort((left, right) => {
        const primary = compare(left, right);
        return primary === 0 ? compareIds(left, right) : primary * direction;
      });

    if (offset > filtered.length) {
      throw new EducationMemoryRepositoryError(
        "education-memory-invalid-query",
        "The pagination cursor is outside the current result set.",
        { field: "cursor" },
      );
    }

    const end = limit === undefined ? filtered.length : Math.min(offset + limit, filtered.length);
    const items = filtered.slice(offset, end).map((entity) => cloneValue(entity, this.cloneValues));
    return end < filtered.length
      ? { items, nextCursor: `memory:${end}` }
      : { items };
  }
}

export function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function compareOptionalText(
  left: string | undefined,
  right: string | undefined,
): number {
  if (left === undefined) return right === undefined ? 0 : 1;
  if (right === undefined) return -1;
  return compareText(left, right);
}

export function createCrudMethods<
  TEntity extends MemoryEntity,
  TId extends string,
  TQuery extends MemoryQuery,
>(
  collection: EntityCollection<TEntity>,
  matches: EntityMatcher<TEntity, TQuery>,
  compare: EntityComparator<TEntity>,
) {
  return {
    create: (entity: TEntity) => collection.create(entity),
    update: (entity: TEntity) => collection.update(entity),
    delete: (id: TId, ownerId: OwnerId) => collection.delete(id, ownerId),
    findById: (id: TId, ownerId: OwnerId) => collection.findById(id, ownerId),
    findMany: (query: TQuery) => collection.findMany(query, matches, compare),
  };
}
