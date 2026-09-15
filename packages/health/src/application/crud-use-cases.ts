import {
  createEntity,
  deleteOwned,
  findOwned,
  listOwned,
  parseApplicationInput,
  parseCreateInput,
  rejectOwnerField,
  updateOwned,
} from "./application.helpers.js";
import type { ValidationSchema } from "@aperture/validation";
import type { HealthEntityRecord, HealthEntityRepository } from "./application.helpers.js";
import type { ContextualQuery, HealthOperationContext, OwnerScopedInput } from "./application.types.js";
import type { HealthServiceDependencies } from "./dependencies.js";

export interface CrudUseCaseHooks<TCreate, TUpdate> {
  readonly beforeCreate?: (input: TCreate, context: HealthOperationContext) => Promise<void>;
  readonly beforeUpdate?: (input: TUpdate, context: HealthOperationContext) => Promise<void>;
}

export interface CrudUseCaseConfiguration<TEntity, TCreate, TUpdate, TQuery> {
  readonly entityType: string;
  readonly createSchema: ValidationSchema<TCreate>;
  readonly updateSchema: ValidationSchema<TUpdate>;
  readonly querySchema: ValidationSchema<TQuery>;
  readonly entitySchema: ValidationSchema<TEntity>;
  readonly defaults?: Readonly<Record<string, unknown>>;
  readonly hooks?: CrudUseCaseHooks<TCreate, TUpdate>;
}

export function createCrudUseCases<
  TEntity extends HealthEntityRecord,
  TId,
  TCreate extends object & { readonly ownerId: string },
  TUpdate extends object,
  TQuery extends object & { readonly ownerId: string },
>(
  dependencies: HealthServiceDependencies,
  repository: HealthEntityRepository<TEntity, TId, TQuery>,
  configuration: CrudUseCaseConfiguration<TEntity, TCreate, TUpdate, TQuery>,
) {
  return Object.freeze({
    async create(
      context: HealthOperationContext,
      input: OwnerScopedInput<TCreate>,
    ): Promise<TEntity> {
      const parsed = parseCreateInput(context, input, configuration.createSchema);
      if (configuration.hooks?.beforeCreate !== undefined) {
        await configuration.hooks.beforeCreate(parsed, context);
      }
      return createEntity(
        dependencies,
        repository,
        context,
        input,
        configuration.createSchema,
        configuration.entitySchema,
        configuration.entityType,
        configuration.defaults,
      );
    },

    async update(
      context: HealthOperationContext,
      id: TId,
      input: TUpdate,
    ): Promise<TEntity> {
      rejectOwnerField(input);
      const parsed = parseApplicationInput(configuration.updateSchema, input);
      if (configuration.hooks?.beforeUpdate !== undefined) {
        await configuration.hooks.beforeUpdate(parsed, context);
      }
      return updateOwned(
        dependencies,
        repository,
        id,
        context,
        input,
        configuration.updateSchema,
        configuration.entitySchema,
        configuration.entityType,
      );
    },

    delete(context: HealthOperationContext, id: TId): Promise<void> {
      return deleteOwned(repository, id, context, configuration.entitySchema, configuration.entityType);
    },

    get(context: HealthOperationContext, id: TId): Promise<TEntity | null> {
      return findOwned(repository, id, context, configuration.entitySchema);
    },

    list(
      context: HealthOperationContext,
      query: ContextualQuery<TQuery> = {} as ContextualQuery<TQuery>,
    ) {
      return listOwned(repository, context, query, configuration.querySchema, configuration.entitySchema);
    },
  });
}
