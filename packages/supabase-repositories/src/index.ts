import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createPostgresRepositorySet,
  createRepositorySet,
  type CreatePostgresRepositorySetOptions,
  type PostgresRepositorySet,
} from "@aperture/postgres-repositories";

import {
  createSupabaseSqlExecutor,
  type SupabaseExecutorConfiguration,
} from "./supabase-sql-executor.js";

export * from "./synchronization-monitor.js";
export { createSupabaseSqlExecutor, type SupabaseExecutorConfiguration } from "./supabase-sql-executor.js";

export interface SupabaseRepositorySet extends PostgresRepositorySet {
  readonly synchronization: ReturnType<typeof createSupabaseSqlExecutor>["monitor"];
}

export interface CreateSupabaseRepositorySetOptions extends CreatePostgresRepositorySetOptions {
  readonly executor?: SupabaseExecutorConfiguration;
}

export function createSupabaseRepositorySet(
  client: SupabaseClient,
  options: CreateSupabaseRepositorySetOptions = {},
): SupabaseRepositorySet {
  const executor = createSupabaseSqlExecutor(client, options.executor);
  return Object.freeze({
    ...createPostgresRepositorySet(executor, options),
    synchronization: executor.monitor,
  });
}

export function createPreviewRepositorySet(): PostgresRepositorySet {
  return createRepositorySet({ mode: "memory" });
}
