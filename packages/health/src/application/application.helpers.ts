import { validateInput } from "@aperture/validation";

import { identifierSchema, ownerIdSchema } from "../health.types.js";
import { HealthApplicationError } from "./application.errors.js";
import type { ValidationSchema } from "@aperture/validation";
import type { OwnerId, PageResult } from "../health.types.js";
import type { HealthOperationContext } from "./application.types.js";
import type { HealthServiceDependencies } from "./dependencies.js";

export interface HealthEntityRecord {
  readonly id: string;
  readonly ownerId: OwnerId;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface HealthEntityRepository<TEntity, TId, TQuery> {
  findById(id: TId, ownerId: OwnerId): Promise<TEntity | null>;
  findMany(query: TQuery): Promise<PageResult<TEntity>>;
  create(entity: TEntity): Promise<TEntity>;
  update(entity: TEntity): Promise<TEntity>;
  delete(id: TId, ownerId: OwnerId): Promise<void>;
}

export function parseApplicationInput<TOutput>(schema: ValidationSchema<TOutput>, input: unknown): TOutput {
  const result = validateInput(schema, input);
  if (result.success) return result.value;
  throw new HealthApplicationError(
    "health-validation-failed",
    result.issues.map((issue) => issue.message).join("; "),
    { issues: result.issues },
  );
}

export function validateApplicationResult<TOutput>(
  schema: ValidationSchema<unknown>,
  output: TOutput,
): TOutput {
  parseApplicationInput(schema, output);
  return output;
}

export function validateContext(context: HealthOperationContext): HealthOperationContext {
  return { ownerId: parseApplicationInput(ownerIdSchema, context.ownerId) };
}

export function rejectOwnerField(input: object): void {
  if (Object.prototype.hasOwnProperty.call(input, "ownerId")) {
    throw new HealthApplicationError(
      "health-owner-mismatch",
      "Operation payloads cannot assign or reassign an owner.",
    );
  }
}

export function parseCreateInput<TCreate extends object>(
  context: HealthOperationContext,
  input: object,
  schema: ValidationSchema<TCreate>,
): TCreate {
  rejectOwnerField(input);
  return parseApplicationInput(schema, { ...input, ownerId: validateContext(context).ownerId });
}

export function contextualQuery<TQuery extends object>(
  context: HealthOperationContext,
  query: object,
  schema: ValidationSchema<TQuery>,
): TQuery {
  rejectOwnerField(query);
  return parseApplicationInput(schema, { ...query, ownerId: validateContext(context).ownerId });
}

export function materializeEntity<TEntity extends HealthEntityRecord>(
  dependencies: HealthServiceDependencies,
  createInput: object,
  defaults: object,
  schema: ValidationSchema<TEntity>,
): TEntity {
  const timestamp = dependencies.clock.now();
  return parseApplicationInput(schema, {
    ...createInput,
    ...defaults,
    id: dependencies.idGenerator.generate(),
    createdAt: timestamp,
    updatedAt: timestamp,
  });
}

export function verifyOwnedResult<TEntity extends HealthEntityRecord>(
  schema: ValidationSchema<TEntity>,
  value: unknown,
  ownerId: OwnerId,
  expectedId?: string,
): TEntity {
  let entity: TEntity;
  try {
    entity = parseApplicationInput(schema, value);
  } catch (error) {
    if (error instanceof HealthApplicationError && error.code === "health-validation-failed") {
      throw new HealthApplicationError(
        "health-repository-contract-violation",
        "A repository returned an invalid entity.",
        error.details,
      );
    }
    throw error;
  }
  if (entity.ownerId !== ownerId || (expectedId !== undefined && entity.id !== expectedId)) {
    throw new HealthApplicationError(
      "health-repository-contract-violation",
      "A repository returned an entity outside the requested ownership or identity boundary.",
      { entityId: entity.id },
    );
  }
  return entity;
}

export async function createEntity<TEntity extends HealthEntityRecord, TId, TCreate extends object, TQuery>(
  dependencies: HealthServiceDependencies,
  repository: HealthEntityRepository<TEntity, TId, TQuery>,
  context: HealthOperationContext,
  input: object,
  createSchema: ValidationSchema<TCreate>,
  entitySchema: ValidationSchema<TEntity>,
  entityType: string,
  defaults: object = {},
): Promise<TEntity> {
  const parsed = parseCreateInput(context, input, createSchema);
  const entity = materializeEntity(dependencies, parsed, defaults, entitySchema);
  const duplicate = await repository.findById(entity.id as TId, entity.ownerId);
  if (duplicate !== null) {
    throw new HealthApplicationError(
      "health-conflict",
      `${entityType} identifier already exists.`,
      { entityType, entityId: entity.id },
    );
  }
  const stored = await repository.create(entity);
  return verifyOwnedResult(entitySchema, stored, entity.ownerId, entity.id);
}

export async function loadOwned<TEntity extends HealthEntityRecord, TId, TQuery>(
  repository: HealthEntityRepository<TEntity, TId, TQuery>,
  id: TId,
  context: HealthOperationContext,
  entitySchema: ValidationSchema<TEntity>,
  entityType: string,
): Promise<TEntity> {
  const ownerId = validateContext(context).ownerId;
  const parsedId = parseApplicationInput(identifierSchema, id) as TId;
  const entity = await repository.findById(parsedId, ownerId);
  if (entity === null) {
    throw new HealthApplicationError(
      "health-record-not-found",
      `${entityType} was not found.`,
      { entityType, entityId: String(parsedId) },
    );
  }
  const verified = verifyOwnedResult(entitySchema, entity, ownerId, String(parsedId));
  return verified;
}

export async function findOwned<TEntity extends HealthEntityRecord, TId, TQuery>(
  repository: HealthEntityRepository<TEntity, TId, TQuery>,
  id: TId,
  context: HealthOperationContext,
  entitySchema: ValidationSchema<TEntity>,
): Promise<TEntity | null> {
  const ownerId = validateContext(context).ownerId;
  const parsedId = parseApplicationInput(identifierSchema, id) as TId;
  const entity = await repository.findById(parsedId, ownerId);
  return entity === null ? null : verifyOwnedResult(entitySchema, entity, ownerId, String(parsedId));
}

export async function requireParent<TEntity extends HealthEntityRecord, TId, TQuery>(
  repository: HealthEntityRepository<TEntity, TId, TQuery>,
  id: TId,
  context: HealthOperationContext,
  schema: ValidationSchema<TEntity>,
  entityType: string,
): Promise<TEntity> {
  try {
    return await loadOwned(repository, id, context, schema, entityType);
  } catch (error) {
    if (error instanceof HealthApplicationError && error.code === "health-record-not-found") {
      throw new HealthApplicationError(
        "health-parent-not-found",
        `Required ${entityType} was not found.`,
        { entityType, entityId: String(id) },
      );
    }
    throw error;
  }
}

export async function updateOwned<TEntity extends HealthEntityRecord, TId, TUpdate extends object, TQuery>(
  dependencies: HealthServiceDependencies,
  repository: HealthEntityRepository<TEntity, TId, TQuery>,
  id: TId,
  context: HealthOperationContext,
  input: object,
  updateSchema: ValidationSchema<TUpdate>,
  entitySchema: ValidationSchema<TEntity>,
  entityType: string,
): Promise<TEntity> {
  rejectOwnerField(input);
  const existing = await loadOwned(repository, id, context, entitySchema, entityType);
  const parsed = parseApplicationInput(updateSchema, input);
  const entity = parseApplicationInput(entitySchema, {
    ...existing,
    ...parsed,
    id: existing.id,
    ownerId: existing.ownerId,
    createdAt: existing.createdAt,
    updatedAt: dependencies.clock.now(),
  });
  const stored = await repository.update(entity);
  return verifyOwnedResult(entitySchema, stored, existing.ownerId, existing.id);
}

export async function deleteOwned<TEntity extends HealthEntityRecord, TId, TQuery>(
  repository: HealthEntityRepository<TEntity, TId, TQuery>,
  id: TId,
  context: HealthOperationContext,
  entitySchema: ValidationSchema<TEntity>,
  entityType: string,
): Promise<void> {
  const existing = await loadOwned(repository, id, context, entitySchema, entityType);
  await repository.delete(id, existing.ownerId);
}

export async function listOwned<TEntity extends HealthEntityRecord, TId, TQuery extends object>(
  repository: HealthEntityRepository<TEntity, TId, TQuery>,
  context: HealthOperationContext,
  query: object,
  querySchema: ValidationSchema<TQuery>,
  entitySchema: ValidationSchema<TEntity>,
): Promise<PageResult<TEntity>> {
  const parsed = contextualQuery(context, query, querySchema);
  const page = await repository.findMany(parsed);
  if (typeof page !== "object" || page === null || !Array.isArray(page.items) ||
    (page.nextCursor !== undefined && typeof page.nextCursor !== "string")) {
    throw new HealthApplicationError(
      "health-repository-contract-violation",
      "A repository returned an invalid result page.",
    );
  }
  const ownerId = (parsed as TQuery & { readonly ownerId: OwnerId }).ownerId;
  const items = page.items.map((item) => verifyOwnedResult(entitySchema, item, ownerId));
  return page.nextCursor === undefined ? { items } : { items, nextCursor: page.nextCursor };
}

export async function collectOwned<TEntity extends HealthEntityRecord, TId, TQuery extends object>(
  repository: HealthEntityRepository<TEntity, TId, TQuery>,
  context: HealthOperationContext,
  query: object,
  querySchema: ValidationSchema<TQuery>,
  entitySchema: ValidationSchema<TEntity>,
): Promise<readonly TEntity[]> {
  const items: TEntity[] = [];
  const seenCursors = new Set<string>();
  let cursor: string | undefined;

  do {
    const page = await listOwned(
      repository,
      context,
      { ...query, limit: 100, ...(cursor === undefined ? {} : { cursor }) },
      querySchema,
      entitySchema,
    );
    items.push(...page.items);
    cursor = page.nextCursor;
    if (cursor !== undefined && seenCursors.has(cursor)) {
      throw new HealthApplicationError(
        "health-repository-contract-violation",
        "A repository returned a repeated pagination cursor.",
      );
    }
    if (cursor !== undefined) seenCursors.add(cursor);
  } while (cursor !== undefined);

  return items;
}

export function invalidTransition(
  entityType: string,
  entityId: string,
  fromState: string,
  toState: string,
): never {
  throw new HealthApplicationError(
    "health-invalid-state-transition",
    `${entityType} cannot transition from ${fromState} to ${toState}.`,
    { entityType, entityId, fromState, toState },
  );
}

export async function transitionOwned<
  TEntity extends HealthEntityRecord & { readonly status: string },
  TId,
  TQuery,
>(
  dependencies: HealthServiceDependencies,
  repository: HealthEntityRepository<TEntity, TId, TQuery>,
  id: TId,
  context: HealthOperationContext,
  entitySchema: ValidationSchema<TEntity>,
  entityType: string,
  allowedFrom: readonly string[],
  toState: TEntity["status"],
  changes: object = {},
): Promise<TEntity> {
  const existing = await loadOwned(repository, id, context, entitySchema, entityType);
  if (!allowedFrom.includes(existing.status)) {
    invalidTransition(entityType, existing.id, existing.status, toState);
  }
  const entity = parseApplicationInput(entitySchema, {
    ...existing,
    ...changes,
    status: toState,
    id: existing.id,
    ownerId: existing.ownerId,
    createdAt: existing.createdAt,
    updatedAt: dependencies.clock.now(),
  });
  const stored = await repository.update(entity);
  return verifyOwnedResult(entitySchema, stored, existing.ownerId, existing.id);
}
