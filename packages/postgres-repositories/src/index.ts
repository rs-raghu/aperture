export { createEducationPostgresRepository } from "./education-postgres.repository.js";
export { createFinancePostgresRepository } from "./finance-postgres.repository.js";
export {
  createHealthPostgresRepository,
  type CreateHealthPostgresRepositoryOptions,
} from "./health-postgres.repository.js";
export {
  PostgresRepositoryError,
  type PostgresRepositoryErrorCode,
  type PostgresRepositorySet,
  type SqlExecutor,
  type SqlQueryResult,
  type TransactionalSqlExecutor,
} from "./postgres.types.js";

import { createEducationPostgresRepository } from "./education-postgres.repository.js";
import { createFinancePostgresRepository } from "./finance-postgres.repository.js";
import { createHealthPostgresRepository } from "./health-postgres.repository.js";
import type { CreateHealthPostgresRepositoryOptions } from "./health-postgres.repository.js";
import {
  createEducationMemoryRepository,
  type CreateEducationMemoryRepositoryOptions,
} from "@aperture/education-memory";
import {
  createFinanceMemoryRepository,
  type CreateFinanceMemoryRepositoryOptions,
} from "@aperture/finance-memory";
import {
  createHealthMemoryRepository,
  type CreateHealthMemoryRepositoryOptions,
} from "@aperture/health-memory";
import {
  PostgresRepositoryError,
  type PostgresRepositorySet,
  type SqlExecutor,
  type TransactionalSqlExecutor,
} from "./postgres.types.js";

export interface CreatePostgresRepositorySetOptions {
  readonly finance?: CreateFinanceMemoryRepositoryOptions;
  readonly health?: CreateHealthPostgresRepositoryOptions;
}

export function createPostgresRepositorySet(
  database: SqlExecutor,
  options: CreatePostgresRepositorySetOptions = {},
): PostgresRepositorySet {
  return Object.freeze({
    education: createEducationPostgresRepository(database),
    health: createHealthPostgresRepository(database, options.health),
    finance: createFinancePostgresRepository(database, options.finance),
  });
}

export type RepositoryComposition =
  | {
      readonly mode: "memory";
      readonly education?: CreateEducationMemoryRepositoryOptions;
      readonly health?: CreateHealthMemoryRepositoryOptions;
      readonly finance?: CreateFinanceMemoryRepositoryOptions;
    }
  | {
      readonly mode: "postgres";
      readonly database: SqlExecutor;
      readonly finance?: CreateFinanceMemoryRepositoryOptions;
      readonly health?: CreateHealthPostgresRepositoryOptions;
    };

export function createRepositorySet(configuration: RepositoryComposition): PostgresRepositorySet {
  if (configuration.mode === "memory") {
    return Object.freeze({
      education: createEducationMemoryRepository(configuration.education),
      health: createHealthMemoryRepository(configuration.health),
      finance: createFinanceMemoryRepository(configuration.finance),
    });
  }
  return Object.freeze({
    education: createEducationPostgresRepository(configuration.database),
    health: createHealthPostgresRepository(configuration.database, configuration.health),
    finance: createFinancePostgresRepository(configuration.database, configuration.finance),
  });
}

export async function runInPostgresTransaction<TResult>(
  database: TransactionalSqlExecutor,
  work: (repositories: PostgresRepositorySet) => Promise<TResult>,
): Promise<TResult> {
  if (typeof database.transaction !== "function") {
    throw new PostgresRepositoryError(
      "postgres-transaction-unavailable",
      "This database client does not expose a transaction boundary.",
    );
  }
  return database.transaction((transaction) => work(createPostgresRepositorySet(transaction)));
}
