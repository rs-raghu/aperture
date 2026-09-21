export interface SqlQueryResult<TRow extends object = Record<string, unknown>> {
  readonly rows: readonly TRow[];
}

export interface SqlExecutor {
  query<TRow extends object = Record<string, unknown>>(
    sql: string,
    parameters?: readonly unknown[],
  ): Promise<SqlQueryResult<TRow>>;
}

export interface TransactionalSqlExecutor extends SqlExecutor {
  transaction<TResult>(work: (transaction: SqlExecutor) => Promise<TResult>): Promise<TResult>;
}

export type PostgresRepositoryErrorCode =
  | "postgres-check-violation"
  | "postgres-duplicate-record"
  | "postgres-foreign-key-violation"
  | "postgres-immutable-identity"
  | "postgres-invalid-entity"
  | "postgres-invalid-query"
  | "postgres-record-not-found"
  | "postgres-storage-failure"
  | "postgres-transaction-unavailable";

export class PostgresRepositoryError extends Error {
  public readonly name = "PostgresRepositoryError";

  public constructor(
    public readonly code: PostgresRepositoryErrorCode,
    message: string,
    public readonly details: Readonly<Record<string, unknown>> = {},
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}

export interface PostgresRepositorySet {
  readonly education: import("@aperture/education").EducationRepository;
  readonly health: import("@aperture/health").HealthRepository;
  readonly finance: import("@aperture/finance").FinanceRepository;
}
