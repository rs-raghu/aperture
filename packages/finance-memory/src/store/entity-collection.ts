import type { PageResult } from "@aperture/finance";
import type { ValidationSchema } from "@aperture/validation";

import { FinanceMemoryRepositoryError } from "../finance-memory.errors.js";
import type { CreateFinanceMemoryRepositoryOptions } from "../finance-memory.types.js";
import { cloneValue } from "./cloning.js";

type StoredEntity = Readonly<Record<string, unknown>> & {
  readonly id: string;
  readonly ownerId: string;
  readonly source: "manual" | "import" | "system";
  readonly createdAt: string;
  readonly updatedAt: string;
};

type RuntimeQuery = Readonly<Record<string, unknown>> & {
  readonly ownerId: string;
  readonly cursor?: string;
  readonly limit?: number;
};

export interface CollectionConfiguration {
  readonly key: string;
  readonly schema: ValidationSchema<unknown>;
  readonly defaults?: Readonly<Record<string, unknown>>;
  readonly filterFields?: readonly string[];
  readonly currencyPath?: string;
  readonly dateField?: string;
  readonly order?: readonly { readonly field: string; readonly direction?: "ascending" | "descending"; readonly numeric?: boolean }[];
}

interface CursorState {
  readonly revision: number;
  readonly offset: number;
  readonly fingerprint: string;
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  if (typeof value === "object" && value !== null) return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`).join(",")}}`;
  return JSON.stringify(value) ?? "undefined";
}

function queryFingerprint(query: RuntimeQuery): string {
  const { cursor: _cursor, limit: _limit, ...scope } = query;
  return stableSerialize(scope);
}

function nestedValue(record: Readonly<Record<string, unknown>>, path: string): unknown {
  return path.split(".").reduce<unknown>((value, segment) => typeof value === "object" && value !== null ? (value as Readonly<Record<string, unknown>>)[segment] : undefined, record);
}

function dateComparable(value: string, boundary: string): string {
  return boundary.length === 10 && value.length > 10 ? value.slice(0, 10) : value;
}

function compareUnknown(left: unknown, right: unknown, numeric: boolean): number {
  if (left === undefined) return right === undefined ? 0 : 1;
  if (right === undefined) return -1;
  if (numeric) return Number(left) - Number(right);
  const leftText = String(left);
  const rightText = String(right);
  return leftText < rightText ? -1 : leftText > rightText ? 1 : 0;
}

export class EntityCollection {
  readonly #records = new Map<string, StoredEntity>();
  readonly #cursors = new Map<string, CursorState>();
  #revision = 0;
  #cursorSequence = 0;
  #entitySequence = 0;
  readonly #cloneValues: boolean;
  readonly #now: () => string;
  readonly #generateId: (collection: string, sequence: number) => string;

  public constructor(private readonly configuration: CollectionConfiguration, options: CreateFinanceMemoryRepositoryOptions) {
    this.#cloneValues = options.cloneValues ?? true;
    this.#now = options.now ?? (() => new Date().toISOString());
    this.#generateId = options.generateId ?? ((collection, sequence) => `${collection}-${sequence}`);
  }

  public async create(input: unknown): Promise<unknown> {
    const source = this.requireObject(input, "create input");
    const now = this.#now();
    const id = typeof source.id === "string" ? source.id : this.#generateId(this.configuration.key, ++this.#entitySequence);
    const candidate = {
      ...this.configuration.defaults,
      ...source,
      id,
      source: source.source ?? "manual",
      createdAt: source.createdAt ?? now,
      updatedAt: source.updatedAt ?? source.createdAt ?? now,
    };
    const entity = this.validateEntity(candidate);
    if (this.#records.has(entity.id)) throw new FinanceMemoryRepositoryError("finance-memory-duplicate-id", "A record with the supplied identifier already exists.", { collection: this.configuration.key, entityId: entity.id });
    const stored = cloneValue(entity, this.#cloneValues);
    this.#records.set(entity.id, stored);
    this.markMutated();
    return cloneValue(stored, this.#cloneValues);
  }

  public async update(id: string, ownerId: string, input: unknown): Promise<unknown> {
    const existing = this.#records.get(id);
    if (!existing || existing.ownerId !== ownerId) this.notFound(id);
    const patch = this.requireObject(input, "update input");
    if ((patch.id !== undefined && patch.id !== id) || (patch.ownerId !== undefined && patch.ownerId !== ownerId) || (patch.createdAt !== undefined && patch.createdAt !== existing.createdAt)) {
      throw new FinanceMemoryRepositoryError("finance-memory-immutable-identity", "Record identity, owner, and creation timestamp are immutable.", { collection: this.configuration.key, entityId: id });
    }
    const entity = this.validateEntity({ ...existing, ...patch, id, ownerId, createdAt: existing.createdAt, updatedAt: patch.updatedAt ?? this.#now() });
    const stored = cloneValue(entity, this.#cloneValues);
    this.#records.set(id, stored);
    this.markMutated();
    return cloneValue(stored, this.#cloneValues);
  }

  public async delete(id: string, ownerId: string): Promise<void> {
    const existing = this.#records.get(id);
    if (!existing || existing.ownerId !== ownerId) this.notFound(id);
    this.#records.delete(id);
    this.markMutated();
  }

  public async findById(id: string, ownerId: string): Promise<unknown | null> {
    const entity = this.#records.get(id);
    return !entity || entity.ownerId !== ownerId ? null : cloneValue(entity, this.#cloneValues);
  }

  public async findMany(input: unknown): Promise<PageResult<unknown>> {
    const query = this.readQuery(input);
    const offset = this.readOffset(query);
    const filtered = [...this.#records.values()]
      .filter((entity) => this.matches(entity, query))
      .sort((left, right) => this.compare(left, right));
    if (offset > filtered.length) this.invalidCursor();
    const end = query.limit === undefined ? filtered.length : Math.min(filtered.length, offset + query.limit);
    const items = filtered.slice(offset, end).map((entity) => cloneValue(entity, this.#cloneValues));
    if (end >= filtered.length) return { items };
    const nextCursor = `finance-memory:${this.configuration.key}:${++this.#cursorSequence}`;
    this.#cursors.set(nextCursor, { revision: this.#revision, offset: end, fingerprint: queryFingerprint(query) });
    return { items, nextCursor };
  }

  private requireObject(value: unknown, label: string): Readonly<Record<string, unknown>> {
    if (typeof value !== "object" || value === null || Array.isArray(value)) throw new FinanceMemoryRepositoryError("finance-memory-invalid-entity", `${label} must be an object.`, { collection: this.configuration.key });
    return value as Readonly<Record<string, unknown>>;
  }

  private validateEntity(value: unknown): StoredEntity {
    const result = this.configuration.schema.safeParse(value);
    if (!result.success) throw new FinanceMemoryRepositoryError("finance-memory-invalid-entity", "Record does not satisfy its Finance entity contract.", { collection: this.configuration.key, issues: result.error.issues });
    return result.data as StoredEntity;
  }

  private readQuery(input: unknown): RuntimeQuery {
    const query = this.requireObject(input, "query");
    if (typeof query.ownerId !== "string" || query.ownerId.trim().length === 0) throw new FinanceMemoryRepositoryError("finance-memory-invalid-query", "A non-empty owner is required.", { field: "ownerId" });
    if (query.limit !== undefined && (typeof query.limit !== "number" || !Number.isInteger(query.limit) || query.limit < 1 || query.limit > 100)) throw new FinanceMemoryRepositoryError("finance-memory-invalid-query", "Pagination limit must be an integer from 1 through 100.", { field: "limit" });
    if (query.cursor !== undefined && typeof query.cursor !== "string") throw new FinanceMemoryRepositoryError("finance-memory-invalid-query", "Pagination cursor must be a string.", { field: "cursor" });
    return query as RuntimeQuery;
  }

  private matches(entity: StoredEntity, query: RuntimeQuery): boolean {
    if (entity.ownerId !== query.ownerId) return false;
    for (const field of this.configuration.filterFields ?? []) {
      if (query[field] !== undefined && entity[field] !== query[field]) return false;
    }
    if (query.currency !== undefined && this.configuration.currencyPath !== undefined && nestedValue(entity, this.configuration.currencyPath) !== query.currency) return false;
    const date = this.configuration.dateField === undefined ? undefined : entity[this.configuration.dateField];
    if (query.range !== undefined) {
      if (typeof date !== "string" || typeof query.range !== "object" || query.range === null) return false;
      const range = query.range as Readonly<Record<string, unknown>>;
      if (typeof range.startsOn !== "string" || typeof range.endsOn !== "string") return false;
      const comparable = dateComparable(date, range.startsOn);
      if (comparable < range.startsOn || dateComparable(date, range.endsOn) > range.endsOn) return false;
    }
    if (query.before !== undefined && (typeof date !== "string" || typeof query.before !== "string" || dateComparable(date, query.before) > query.before)) return false;
    return true;
  }

  private compare(left: StoredEntity, right: StoredEntity): number {
    for (const rule of this.configuration.order ?? []) {
      const compared = compareUnknown(left[rule.field], right[rule.field], rule.numeric ?? false);
      if (compared !== 0) return rule.direction === "descending" ? -compared : compared;
    }
    return left.id.localeCompare(right.id);
  }

  private readOffset(query: RuntimeQuery): number {
    if (query.cursor === undefined) return 0;
    const state = this.#cursors.get(query.cursor);
    const [namespace, key, sequence, extra] = query.cursor.split(":");
    if (namespace !== "finance-memory" || key !== this.configuration.key || !sequence || extra !== undefined || !state || state.revision !== this.#revision || state.fingerprint !== queryFingerprint(query)) this.invalidCursor();
    return state.offset;
  }

  private invalidCursor(): never {
    throw new FinanceMemoryRepositoryError("finance-memory-invalid-query", "Pagination cursor is invalid or stale for this collection.", { field: "cursor", collection: this.configuration.key });
  }

  private notFound(id: string): never {
    throw new FinanceMemoryRepositoryError("finance-memory-record-not-found", "The requested record is unavailable.", { collection: this.configuration.key, entityId: id });
  }

  private markMutated(): void {
    this.#revision += 1;
    this.#cursors.clear();
  }
}
