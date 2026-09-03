import { validateInput } from "@aperture/validation";
import type { ValidationSchema } from "@aperture/validation";

import { ownerIdSchema } from "../education.types.js";
import type { OwnerId, PageResult } from "../education.types.js";
import type { ReadRepository, RepositoryFilter } from "../repositories/repository.types.js";
import { EducationApplicationError } from "./application.errors.js";
import type { EducationOperationContext } from "./application.types.js";
import type { EducationServiceDependencies } from "./dependencies.js";

export interface EducationEntityRecord {
  readonly id: string;
  readonly ownerId: OwnerId;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function parseApplicationInput<TOutput>(schema: ValidationSchema<TOutput>, input: unknown): TOutput {
  const result = validateInput(schema, input);
  if (result.success) return result.value;
  throw new EducationApplicationError(
    "education-validation-failed",
    result.issues.map((issue) => issue.message).join("; "),
    { issues: result.issues },
  );
}

export function validateContext(context: EducationOperationContext): EducationOperationContext {
  return { ownerId: parseApplicationInput(ownerIdSchema, context.ownerId) };
}

export function rejectOwnerField(input: object): void {
  if (Object.prototype.hasOwnProperty.call(input, "ownerId")) {
    throw new EducationApplicationError(
      "education-owner-mismatch",
      "Operation payloads cannot assign or reassign an owner.",
    );
  }
}

export function ownerQuery<TQuery extends object>(
  context: EducationOperationContext,
  query: TQuery,
): TQuery & { readonly ownerId: OwnerId } {
  rejectOwnerField(query);
  const validated = validateContext(context);
  return { ...query, ownerId: validated.ownerId };
}

export function parseCreateInput<TCreate extends object>(
  context: EducationOperationContext,
  input: object,
  createSchema: ValidationSchema<TCreate>,
): TCreate {
  rejectOwnerField(input);
  const { ownerId } = validateContext(context);
  return parseApplicationInput(createSchema, { ...input, ownerId });
}

export function materializeEntity<TEntity extends EducationEntityRecord>(
  dependencies: EducationServiceDependencies,
  createInput: object,
  entitySchema: ValidationSchema<TEntity>,
): TEntity {
  const timestamp = dependencies.clock.now();
  return Object.freeze(parseApplicationInput(entitySchema, {
    ...createInput,
    id: dependencies.idGenerator.generate(),
    createdAt: timestamp,
    updatedAt: timestamp,
  }));
}

export function updateEntity<TEntity extends EducationEntityRecord, TUpdate extends object>(
  dependencies: EducationServiceDependencies,
  existing: TEntity,
  input: TUpdate,
  updateSchema: ValidationSchema<object>,
  entitySchema: ValidationSchema<TEntity>,
): TEntity {
  rejectOwnerField(input);
  const parsed = parseApplicationInput(updateSchema, input) as Readonly<Record<string, unknown>>;
  return Object.freeze(parseApplicationInput(entitySchema, {
    ...existing,
    ...parsed,
    id: existing.id,
    ownerId: existing.ownerId,
    createdAt: existing.createdAt,
    updatedAt: dependencies.clock.now(),
  }));
}

export async function loadOwned<TEntity extends EducationEntityRecord, TId, TFilter extends RepositoryFilter>(
  repository: ReadRepository<TEntity, TId, TFilter>,
  id: TId,
  context: EducationOperationContext,
  entityType: string,
): Promise<TEntity> {
  const { ownerId } = validateContext(context);
  const entity = await repository.findById(id, ownerId);
  if (entity === null) {
    throw new EducationApplicationError(
      "education-record-not-found",
      `${entityType} was not found.`,
      { entityType, entityId: String(id) },
    );
  }
  if (entity.ownerId !== ownerId) {
    throw new EducationApplicationError(
      "education-owner-mismatch",
      `${entityType} does not belong to the current owner.`,
      { entityType, entityId: entity.id },
    );
  }
  return entity;
}

export async function findOwned<TEntity extends EducationEntityRecord, TId, TFilter extends RepositoryFilter>(
  repository: ReadRepository<TEntity, TId, TFilter>,
  id: TId,
  context: EducationOperationContext,
  entityType: string,
): Promise<TEntity | null> {
  const { ownerId } = validateContext(context);
  const entity = await repository.findById(id, ownerId);
  if (entity !== null && entity.ownerId !== ownerId) {
    throw new EducationApplicationError(
      "education-owner-mismatch",
      `${entityType} does not belong to the current owner.`,
      { entityType, entityId: entity.id },
    );
  }
  return entity;
}

export async function requireParent<TEntity extends EducationEntityRecord, TId, TFilter extends RepositoryFilter>(
  repository: ReadRepository<TEntity, TId, TFilter>,
  id: TId,
  context: EducationOperationContext,
  entityType: string,
): Promise<TEntity> {
  try {
    return await loadOwned(repository, id, context, entityType);
  } catch (error) {
    if (error instanceof EducationApplicationError && error.code === "education-record-not-found") {
      throw new EducationApplicationError(
        "education-parent-not-found",
        `Required ${entityType} was not found.`,
        { entityType, entityId: String(id) },
      );
    }
    throw error;
  }
}

export function invalidTransition(entityType: string, entityId: string, from: string, to: string): never {
  throw new EducationApplicationError(
    "education-invalid-state-transition",
    `${entityType} cannot transition from ${from} to ${to}.`,
    { entityType, entityId },
  );
}

export function conflict(entityType: string, entityId: string | undefined, message: string): never {
  throw new EducationApplicationError(
    "education-conflict",
    message,
    entityId === undefined ? { entityType } : { entityType, entityId },
  );
}

export function relatedRecords(entityType: string, entityId: string, message: string): never {
  throw new EducationApplicationError(
    "education-related-records-exist",
    message,
    { entityType, entityId },
  );
}

export function sortedPage<TEntity>(
  page: PageResult<TEntity>,
  compare: (left: TEntity, right: TEntity) => number,
  direction: "ascending" | "descending" = "ascending",
): PageResult<TEntity> {
  const items = [...page.items].sort(compare);
  if (direction === "descending") items.reverse();
  return page.nextCursor === undefined ? { items } : { items, nextCursor: page.nextCursor };
}

export function stableTextCompare(left: string | undefined, right: string | undefined, leftId: string, rightId: string): number {
  const leftValue = left ?? "";
  const rightValue = right ?? "";
  const primary = leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
  return primary === 0 ? (leftId < rightId ? -1 : leftId > rightId ? 1 : 0) : primary;
}
