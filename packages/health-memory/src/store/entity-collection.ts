import type { OwnerId, PageResult } from "@aperture/health";

import { HealthMemoryRepositoryError } from "../health-memory.errors.js";
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
}

export type EntityMatcher<TEntity, TQuery> = (entity: TEntity, query: TQuery) => boolean;
export type EntityComparator<TEntity> = (left: TEntity, right: TEntity) => number;

interface CursorState {
  readonly revision: number;
  readonly offset: number;
  readonly queryFingerprint: string;
}

function compareIds(left: MemoryEntity, right: MemoryEntity): number {
  return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
}

function invalidCursor(): never {
  throw new HealthMemoryRepositoryError(
    "health-memory-invalid-query",
    "The pagination cursor is invalid or stale for this memory collection.",
    { field: "cursor" },
  );
}

function readLimit(limit: number | undefined): number | undefined {
  if (limit === undefined) return undefined;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new HealthMemoryRepositoryError(
      "health-memory-invalid-query",
      "The pagination limit must be an integer from 1 through 100.",
      { field: "limit" },
    );
  }
  return limit;
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value)
      .sort(([left], [right]) => compareText(left, right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}

function fingerprintQuery(query: MemoryQuery): string {
  const { cursor: _cursor, limit: _limit, ...scope } = query;
  return stableSerialize(scope);
}

export class EntityCollection<TEntity extends MemoryEntity> {
  readonly #records = new Map<string, TEntity>();
  readonly #cursors = new Map<string, CursorState>();
  #revision = 0;
  #nextCursorId = 0;

  public constructor(
    private readonly collectionKey: string,
    private readonly cloneValues: boolean,
  ) {}

  public async create(entity: TEntity): Promise<TEntity> {
    if (this.#records.has(entity.id)) {
      throw new HealthMemoryRepositoryError(
        "health-memory-duplicate-id",
        "A record with the supplied identifier already exists.",
        { entityId: entity.id },
      );
    }
    const stored = cloneValue(entity, this.cloneValues);
    this.#records.set(entity.id, stored);
    this.markMutated();
    return cloneValue(stored, this.cloneValues);
  }

  public async update(entity: TEntity): Promise<TEntity> {
    const existing = this.#records.get(entity.id);
    if (existing === undefined || existing.ownerId !== entity.ownerId) {
      throw new HealthMemoryRepositoryError(
        "health-memory-record-not-found",
        "The requested record is unavailable.",
        { entityId: entity.id },
      );
    }
    if (existing.createdAt !== entity.createdAt) {
      throw new HealthMemoryRepositoryError(
        "health-memory-immutable-identity",
        "The record creation timestamp cannot be changed.",
        { entityId: entity.id, field: "createdAt" },
      );
    }
    const stored = cloneValue(entity, this.cloneValues);
    this.#records.set(entity.id, stored);
    this.markMutated();
    return cloneValue(stored, this.cloneValues);
  }

  public async delete(id: string, ownerId: OwnerId): Promise<void> {
    const existing = this.#records.get(id);
    if (existing === undefined || existing.ownerId !== ownerId) {
      throw new HealthMemoryRepositoryError(
        "health-memory-record-not-found",
        "The requested record is unavailable.",
        { entityId: id },
      );
    }
    this.#records.delete(id);
    this.markMutated();
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
    const offset = this.readOffset(query);
    const filtered = [...this.#records.values()]
      .filter((entity) => entity.ownerId === query.ownerId && matches(entity, query))
      .sort((left, right) => compare(left, right) || compareIds(left, right));

    if (offset > filtered.length) invalidCursor();
    const end = limit === undefined ? filtered.length : Math.min(offset + limit, filtered.length);
    const items = filtered.slice(offset, end).map((entity) => cloneValue(entity, this.cloneValues));
    if (end >= filtered.length) return { items };
    const cursorId = String(++this.#nextCursorId);
    const nextCursor = `health-memory:${this.collectionKey}:${cursorId}`;
    this.#cursors.set(nextCursor, {
      revision: this.#revision,
      offset: end,
      queryFingerprint: fingerprintQuery(query),
    });
    return { items, nextCursor };
  }

  private markMutated(): void {
    this.#revision += 1;
    this.#cursors.clear();
  }

  private readOffset(query: MemoryQuery): number {
    if (query.cursor === undefined) return 0;
    const [namespace, collectionKey, cursorId, extra] = query.cursor.split(":");
    const state = this.#cursors.get(query.cursor);
    if (
      namespace !== "health-memory" ||
      collectionKey !== this.collectionKey ||
      cursorId === undefined ||
      extra !== undefined ||
      state === undefined ||
      state.revision !== this.#revision ||
      state.queryFingerprint !== fingerprintQuery(query)
    ) invalidCursor();
    return state.offset;
  }
}

export function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function compareNumber(left: number, right: number): number {
  return left - right;
}

export function compareOptionalText(left: string | undefined, right: string | undefined): number {
  if (left === undefined) return right === undefined ? 0 : 1;
  if (right === undefined) return -1;
  return compareText(left, right);
}
