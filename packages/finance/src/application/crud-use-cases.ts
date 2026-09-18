import { validateInput } from "@aperture/validation";

import type { ValidationSchema } from "@aperture/validation";
import type { PageResult } from "../finance.types.js";
import type { CrudRepository } from "../repositories/repository.types.js";
import { FinanceApplicationError } from "./application.errors.js";
import type { ContextualQuery, FinanceOperationContext, FinanceServiceDependencies, OwnerScopedInput } from "./application.types.js";

export interface FinanceEntity {
  readonly id: string;
  readonly ownerId: string;
  readonly source: "manual" | "import" | "system";
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly status?: string;
}

interface CrudHooks<TEntity, TCreateInput, TUpdateInput> {
  readonly beforeCreate?: (input: TCreateInput, context: FinanceOperationContext) => Promise<void>;
  readonly beforeUpdate?: (existing: TEntity, input: TUpdateInput, context: FinanceOperationContext) => Promise<void>;
}

export interface CrudConfiguration<TEntity extends FinanceEntity, TCreateInput extends { readonly ownerId: string }, TUpdateInput> {
  readonly entityType: string;
  readonly createSchema: ValidationSchema<unknown>;
  readonly updateSchema: ValidationSchema<unknown>;
  readonly querySchema: ValidationSchema<unknown>;
  readonly entitySchema: ValidationSchema<unknown>;
  readonly defaults?: Readonly<Record<string, unknown>>;
  readonly managedStatus?: boolean;
  readonly hooks?: CrudHooks<TEntity, TCreateInput, TUpdateInput>;
}

export function parseApplicationInput<T>(schema: ValidationSchema<T>, value: unknown): T {
  const result = validateInput(schema, value);
  if (result.success) return result.value;
  throw new FinanceApplicationError("finance-invalid-input", result.issues.map(({ message }) => message).join("; "), { issues: result.issues });
}

export function validateContext(context: FinanceOperationContext): FinanceOperationContext {
  if (typeof context?.ownerId !== "string" || context.ownerId.trim().length === 0) {
    throw new FinanceApplicationError("finance-invalid-input", "A non-empty owner context is required.");
  }
  return { ownerId: context.ownerId.trim() };
}

function rejectOwnerField(value: unknown): void {
  if (typeof value === "object" && value !== null && Object.prototype.hasOwnProperty.call(value, "ownerId")) {
    throw new FinanceApplicationError("finance-invalid-input", "Owner identity must come from the operation context.");
  }
}

function verifyEntity<TEntity extends FinanceEntity>(entity: unknown, context: FinanceOperationContext, schema: ValidationSchema<unknown>, entityType: string, expectedId?: string): TEntity {
  const parsed = parseApplicationInput(schema, entity) as TEntity;
  if (parsed.ownerId !== context.ownerId) {
    throw new FinanceApplicationError("finance-owner-mismatch", `The ${entityType} repository returned a record for another owner.`, { entityType, entityId: parsed.id });
  }
  if (expectedId !== undefined && parsed.id !== expectedId) {
    throw new FinanceApplicationError("finance-repository-contract-violation", `The ${entityType} repository changed the requested identity.`, { entityType, expectedId, actualId: parsed.id });
  }
  return parsed;
}

export function createCrudUseCases<
  TEntity extends FinanceEntity,
  TId extends string,
  TCreateInput extends { readonly ownerId: string },
  TUpdateInput,
  TQuery extends { readonly ownerId: string },
>(
  dependencies: FinanceServiceDependencies,
  repository: CrudRepository<TEntity, TId, TCreateInput, TUpdateInput, TQuery>,
  configuration: CrudConfiguration<TEntity, TCreateInput, TUpdateInput>,
) {
  const requireOwned = async (context: FinanceOperationContext, id: TId): Promise<TEntity> => {
    const ownedContext = validateContext(context);
    const entity = await repository.findById(id, ownedContext.ownerId);
    if (entity === null) throw new FinanceApplicationError("finance-not-found", `${configuration.entityType} was not found.`, { entityType: configuration.entityType, entityId: id });
    return verifyEntity<TEntity>(entity, ownedContext, configuration.entitySchema, configuration.entityType, id);
  };

  const create = async (context: FinanceOperationContext, input: OwnerScopedInput<TCreateInput>): Promise<TEntity> => {
    const ownedContext = validateContext(context);
    rejectOwnerField(input);
    const parsed = parseApplicationInput(configuration.createSchema, { ...input, ownerId: ownedContext.ownerId }) as TCreateInput;
    await configuration.hooks?.beforeCreate?.(parsed, ownedContext);
    const now = dependencies.clock.now();
    const id = dependencies.idGenerator.next(configuration.entityType);
    const materialized = parseApplicationInput(configuration.entitySchema, {
      ...configuration.defaults,
      ...parsed,
      id,
      ownerId: ownedContext.ownerId,
      source: "manual",
      createdAt: now,
      updatedAt: now,
    }) as TEntity;
    const created = await repository.create(materialized as unknown as TCreateInput);
    return verifyEntity<TEntity>(created, ownedContext, configuration.entitySchema, configuration.entityType, id);
  };

  const update = async (context: FinanceOperationContext, id: TId, input: TUpdateInput): Promise<TEntity> => {
    const ownedContext = validateContext(context);
    rejectOwnerField(input);
    const parsed = parseApplicationInput(configuration.updateSchema, input) as TUpdateInput;
    if (configuration.managedStatus && typeof parsed === "object" && parsed !== null && "status" in parsed && parsed.status !== undefined) {
      throw new FinanceApplicationError("finance-invalid-state-transition", `${configuration.entityType} status must be changed through a lifecycle operation.`, { entityType: configuration.entityType, entityId: id });
    }
    const existing = await requireOwned(ownedContext, id);
    await configuration.hooks?.beforeUpdate?.(existing, parsed, ownedContext);
    const updated = await repository.update(id, ownedContext.ownerId, { ...parsed, updatedAt: dependencies.clock.now() });
    return verifyEntity<TEntity>(updated, ownedContext, configuration.entitySchema, configuration.entityType, id);
  };

  const get = async (context: FinanceOperationContext, id: TId): Promise<TEntity> => requireOwned(context, id);

  const list = async (context: FinanceOperationContext, query: ContextualQuery<TQuery> = {} as ContextualQuery<TQuery>): Promise<PageResult<TEntity>> => {
    const ownedContext = validateContext(context);
    rejectOwnerField(query);
    const parsedQuery = parseApplicationInput(configuration.querySchema, { ...query, ownerId: ownedContext.ownerId }) as TQuery;
    const result = await repository.findMany(parsedQuery);
    if (!Array.isArray(result.items)) throw new FinanceApplicationError("finance-repository-contract-violation", `${configuration.entityType} list did not contain items.`);
    return {
      items: result.items.map((item) => verifyEntity<TEntity>(item, ownedContext, configuration.entitySchema, configuration.entityType)),
      ...(result.nextCursor === undefined ? {} : { nextCursor: result.nextCursor }),
    };
  };

  const remove = async (context: FinanceOperationContext, id: TId): Promise<void> => {
    const ownedContext = validateContext(context);
    await requireOwned(ownedContext, id);
    await repository.delete(id, ownedContext.ownerId);
  };

  const transition = async (context: FinanceOperationContext, id: TId, allowed: readonly string[], status: string): Promise<TEntity> => {
    const ownedContext = validateContext(context);
    const existing = await requireOwned(ownedContext, id);
    if (existing.status === undefined || !allowed.includes(existing.status)) {
      throw new FinanceApplicationError("finance-invalid-state-transition", `Cannot change ${configuration.entityType} from ${existing.status ?? "no status"} to ${status}.`, { entityType: configuration.entityType, entityId: id, fromState: existing.status, toState: status });
    }
    const updated = await repository.update(id, ownedContext.ownerId, { status, updatedAt: dependencies.clock.now() } as TUpdateInput);
    return verifyEntity<TEntity>(updated, ownedContext, configuration.entitySchema, configuration.entityType, id);
  };

  return Object.freeze({ create, update, get, list, delete: remove, transition, requireOwned });
}

export async function collectAll<TEntity extends FinanceEntity, TQuery extends { readonly ownerId: string }>(
  repository: { findMany(query: TQuery): Promise<PageResult<TEntity>> },
  context: FinanceOperationContext,
  query: Omit<TQuery, "ownerId" | "cursor" | "limit">,
): Promise<readonly TEntity[]> {
  const items: TEntity[] = [];
  let cursor: string | undefined;
  const seen = new Set<string>();
  do {
    const page = await repository.findMany({ ...query, ownerId: context.ownerId, limit: 100, ...(cursor === undefined ? {} : { cursor }) } as unknown as TQuery);
    for (const item of page.items) {
      if (item.ownerId !== context.ownerId) throw new FinanceApplicationError("finance-owner-mismatch", "A repository list returned a record for another owner.", { entityId: item.id });
      items.push(item);
    }
    cursor = page.nextCursor;
    if (cursor !== undefined && seen.has(cursor)) throw new FinanceApplicationError("finance-repository-contract-violation", "Repository pagination repeated a cursor.", { cursor });
    if (cursor !== undefined) seen.add(cursor);
  } while (cursor !== undefined);
  return items;
}
