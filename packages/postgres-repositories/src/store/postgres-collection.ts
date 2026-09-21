import { PostgresRepositoryError, type SqlExecutor } from "../postgres.types.js";

export interface DurableEntity {
  readonly id: string;
  readonly ownerId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface DurableQuery {
  readonly ownerId: string;
  readonly cursor?: string | undefined;
  readonly limit?: number | undefined;
}

export type EntityMatcher<TEntity, TQuery> = (entity: TEntity, query: TQuery) => boolean;
export type EntityComparator<TEntity> = (left: TEntity, right: TEntity) => number;

export interface RuntimeSchema<TEntity> {
  safeParse(value: unknown):
    | { readonly success: true; readonly data: TEntity }
    | { readonly success: false; readonly error: { readonly issues: readonly unknown[] } };
}

export interface CollectionConfiguration<TEntity extends DurableEntity> {
  readonly schema: string;
  readonly table: string;
  readonly entitySchema?: RuntimeSchema<TEntity>;
  readonly project: (entity: TEntity) => Readonly<Record<string, unknown>>;
}

interface StoredRow {
  readonly payload: unknown;
  readonly record_version: string | number | bigint;
  readonly updated_at: string | Date;
}

interface CursorValue {
  readonly version: 1;
  readonly namespace: string;
  readonly ownerId: string;
  readonly offset: number;
  readonly fingerprint: string;
  readonly snapshot: string;
}

const IDENTIFIER = /^[a-z][a-z0-9_]*$/;

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(",")}]`;
  if (typeof value === "object" && value !== null) {
    return `{${Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}

function clone<TEntity>(value: TEntity): TEntity {
  return structuredClone(value);
}

function queryFingerprint(query: DurableQuery): string {
  const { cursor: _cursor, limit: _limit, ...scope } = query;
  return stableSerialize(scope);
}

function encodeCursor(value: CursorValue): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

function decodeCursor(cursor: string): CursorValue {
  try {
    const value = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as Partial<CursorValue>;
    if (
      value.version !== 1 ||
      typeof value.namespace !== "string" ||
      typeof value.ownerId !== "string" ||
      !Number.isSafeInteger(value.offset) ||
      (value.offset ?? -1) < 0 ||
      typeof value.fingerprint !== "string" ||
      typeof value.snapshot !== "string"
    ) {
      throw new Error("Malformed cursor");
    }
    return value as CursorValue;
  } catch (error) {
    throw new PostgresRepositoryError(
      "postgres-invalid-query",
      "The pagination cursor is invalid.",
      { field: "cursor" },
      { cause: error },
    );
  }
}

function readLimit(limit: number | undefined): number | undefined {
  if (limit === undefined) return undefined;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new PostgresRepositoryError(
      "postgres-invalid-query",
      "The pagination limit must be an integer from 1 through 100.",
      { field: "limit" },
    );
  }
  return limit;
}

function databaseCode(error: unknown): string | undefined {
  return typeof error === "object" && error !== null && "code" in error
    ? String((error as { readonly code?: unknown }).code)
    : undefined;
}

function mapDatabaseError(error: unknown, namespace: string, entityId?: string): never {
  if (error instanceof PostgresRepositoryError) throw error;
  const details = { namespace, ...(entityId === undefined ? {} : { entityId }) };
  switch (databaseCode(error)) {
    case "23505":
      throw new PostgresRepositoryError(
        "postgres-duplicate-record",
        "A record conflicts with an existing durable record.",
        details,
        { cause: error },
      );
    case "23503":
      throw new PostgresRepositoryError(
        "postgres-foreign-key-violation",
        "A related durable record is missing or belongs to another owner.",
        details,
        { cause: error },
      );
    case "23514":
    case "23502":
    case "22P02":
      throw new PostgresRepositoryError(
        "postgres-check-violation",
        "The record violates a durable schema constraint.",
        details,
        { cause: error },
      );
    default:
      throw new PostgresRepositoryError(
        "postgres-storage-failure",
        "The durable repository operation failed.",
        { ...details, databaseCode: databaseCode(error) },
        { cause: error },
      );
  }
}

export class PostgresCollection<TEntity extends DurableEntity> {
  readonly #qualifiedTable: string;
  readonly #namespace: string;

  public constructor(
    private readonly database: SqlExecutor,
    private readonly configuration: CollectionConfiguration<TEntity>,
  ) {
    if (!IDENTIFIER.test(configuration.schema) || !IDENTIFIER.test(configuration.table)) {
      throw new PostgresRepositoryError(
        "postgres-invalid-query",
        "A repository table identifier is invalid.",
      );
    }
    this.#qualifiedTable = `${configuration.schema}.${configuration.table}`;
    this.#namespace = `${configuration.schema}.${configuration.table}`;
  }

  public async create(entity: TEntity): Promise<TEntity> {
    const candidate = this.validateEntity(entity);
    const projection = this.configuration.project(candidate);
    const columns = Object.keys(projection);
    const values = columns.map((column) => projection[column]);
    const parameters = [
      candidate.id,
      candidate.ownerId,
      JSON.stringify(candidate),
      candidate.createdAt,
      candidate.updatedAt,
      ...values,
    ];
    const columnSql = columns.length === 0 ? "" : `, ${columns.join(", ")}`;
    const valueSql = columns.length === 0
      ? ""
      : `, ${columns.map((_, index) => `$${index + 6}`).join(", ")}`;
    try {
      await this.database.query(
        `insert into ${this.#qualifiedTable} (id, owner_id, payload, created_at, updated_at${columnSql}) values ($1, $2, $3::jsonb, $4::timestamptz, $5::timestamptz${valueSql})`,
        parameters,
      );
      return clone(candidate);
    } catch (error) {
      mapDatabaseError(error, this.#namespace, candidate.id);
    }
  }

  public async update(entity: TEntity): Promise<TEntity> {
    const candidate = this.validateEntity(entity);
    const existing = await this.findById(candidate.id, candidate.ownerId);
    if (existing === null) this.notFound(candidate.id);
    if (existing.createdAt !== candidate.createdAt) {
      throw new PostgresRepositoryError(
        "postgres-immutable-identity",
        "The record owner and creation timestamp are immutable.",
        { namespace: this.#namespace, entityId: candidate.id, field: "createdAt" },
      );
    }

    const projection = this.configuration.project(candidate);
    const columns = Object.keys(projection);
    const assignments = columns.map((column, index) => `${column} = $${index + 6}`);
    const parameters = [
      JSON.stringify(candidate),
      candidate.updatedAt,
      candidate.id,
      candidate.ownerId,
      candidate.createdAt,
      ...columns.map((column) => projection[column]),
    ];
    const projectionSql = assignments.length === 0 ? "" : `, ${assignments.join(", ")}`;
    try {
      const result = await this.database.query(
        `update ${this.#qualifiedTable} set payload = $1::jsonb, updated_at = $2::timestamptz${projectionSql} where id = $3 and owner_id = $4 and created_at = $5::timestamptz and deleted_at is null returning id`,
        parameters,
      );
      if (result.rows.length === 0) this.notFound(candidate.id);
      return clone(candidate);
    } catch (error) {
      mapDatabaseError(error, this.#namespace, candidate.id);
    }
  }

  public async delete(id: string, ownerId: string): Promise<void> {
    try {
      const result = await this.database.query(
        `update ${this.#qualifiedTable} set deleted_at = statement_timestamp() where id = $1 and owner_id = $2 and deleted_at is null returning id`,
        [id, ownerId],
      );
      if (result.rows.length === 0) this.notFound(id);
    } catch (error) {
      mapDatabaseError(error, this.#namespace, id);
    }
  }

  public async findById(id: string, ownerId: string): Promise<TEntity | null> {
    try {
      const result = await this.database.query<StoredRow>(
        `select payload, record_version, updated_at from ${this.#qualifiedTable} where id = $1 and owner_id = $2 and deleted_at is null`,
        [id, ownerId],
      );
      const row = result.rows[0];
      return row === undefined ? null : this.mapRow(row);
    } catch (error) {
      mapDatabaseError(error, this.#namespace, id);
    }
  }

  public async findFirst(
    ownerId: string,
    predicate: (entity: TEntity) => boolean,
  ): Promise<TEntity | null> {
    const entities = await this.loadOwnerRows(ownerId);
    const entity = entities.map(({ entity }) => entity).filter(predicate).sort(compareIds)[0];
    return entity === undefined ? null : clone(entity);
  }

  public async findMany<TQuery extends DurableQuery>(
    query: TQuery,
    matches: EntityMatcher<TEntity, TQuery>,
    compare: EntityComparator<TEntity>,
  ): Promise<{ readonly items: readonly TEntity[]; readonly nextCursor?: string }> {
    if (typeof query.ownerId !== "string" || query.ownerId.trim().length === 0) {
      throw new PostgresRepositoryError(
        "postgres-invalid-query",
        "A non-empty owner is required.",
        { field: "ownerId" },
      );
    }
    const limit = readLimit(query.limit);
    const rows = await this.loadOwnerRows(query.ownerId);
    const snapshot = stableSerialize(
      rows.map(({ entity, version, updatedAt }) => [entity.id, version, updatedAt]),
    );
    const fingerprint = queryFingerprint(query);
    let offset = 0;
    if (query.cursor !== undefined) {
      const cursor = decodeCursor(query.cursor);
      if (
        cursor.namespace !== this.#namespace ||
        cursor.ownerId !== query.ownerId ||
        cursor.fingerprint !== fingerprint ||
        cursor.snapshot !== snapshot
      ) {
        throw new PostgresRepositoryError(
          "postgres-invalid-query",
          "The pagination cursor is stale or belongs to another query.",
          { field: "cursor", namespace: this.#namespace },
        );
      }
      offset = cursor.offset;
    }

    const direction = "sortDirection" in query && query.sortDirection === "descending" ? -1 : 1;
    const filtered = rows
      .map(({ entity }) => entity)
      .filter((entity) => matches(entity, query))
      .sort((left, right) => {
        const primary = compare(left, right);
        return primary === 0 ? compareIds(left, right) : primary * direction;
      });
    if (offset > filtered.length) {
      throw new PostgresRepositoryError(
        "postgres-invalid-query",
        "The pagination cursor is outside the current result set.",
        { field: "cursor", namespace: this.#namespace },
      );
    }
    const end = limit === undefined ? filtered.length : Math.min(filtered.length, offset + limit);
    const items = filtered.slice(offset, end).map(clone);
    if (end >= filtered.length) return { items };
    return {
      items,
      nextCursor: encodeCursor({
        version: 1,
        namespace: this.#namespace,
        ownerId: query.ownerId,
        offset: end,
        fingerprint,
        snapshot,
      }),
    };
  }

  private async loadOwnerRows(ownerId: string): Promise<readonly {
    readonly entity: TEntity;
    readonly version: string;
    readonly updatedAt: string;
  }[]> {
    try {
      const result = await this.database.query<StoredRow>(
        `select payload, record_version, updated_at from ${this.#qualifiedTable} where owner_id = $1 and deleted_at is null`,
        [ownerId],
      );
      return result.rows.map((row) => ({
        entity: this.mapRow(row),
        version: String(row.record_version),
        updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
      }));
    } catch (error) {
      mapDatabaseError(error, this.#namespace);
    }
  }

  private mapRow(row: StoredRow): TEntity {
    return clone(this.validateEntity(row.payload));
  }

  private validateEntity(value: unknown): TEntity {
    if (this.configuration.entitySchema !== undefined) {
      const result = this.configuration.entitySchema.safeParse(value);
      if (!result.success) {
        throw new PostgresRepositoryError(
          "postgres-invalid-entity",
          "A record does not satisfy its domain entity contract.",
          { namespace: this.#namespace, issues: result.error.issues },
        );
      }
      return result.data;
    }
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new PostgresRepositoryError(
        "postgres-invalid-entity",
        "A durable record payload must be an object.",
        { namespace: this.#namespace },
      );
    }
    const entity = value as Partial<DurableEntity>;
    if (
      typeof entity.id !== "string" ||
      typeof entity.ownerId !== "string" ||
      typeof entity.createdAt !== "string" ||
      typeof entity.updatedAt !== "string"
    ) {
      throw new PostgresRepositoryError(
        "postgres-invalid-entity",
        "A durable record payload is missing repository metadata.",
        { namespace: this.#namespace },
      );
    }
    return value as TEntity;
  }

  private notFound(id: string): never {
    throw new PostgresRepositoryError(
      "postgres-record-not-found",
      "The requested durable record is unavailable.",
      { namespace: this.#namespace, entityId: id },
    );
  }
}

function compareIds(left: DurableEntity, right: DurableEntity): number {
  return left.id.localeCompare(right.id);
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

export function compareNumber(left: number, right: number): number {
  return left - right;
}
