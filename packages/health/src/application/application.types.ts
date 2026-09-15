import type { OwnerId } from "../health.types.js";

export interface HealthOperationContext {
  readonly ownerId: OwnerId;
}

export type OwnerScopedInput<TInput extends { readonly ownerId: OwnerId }> = Omit<TInput, "ownerId">;
export type ContextualQuery<TQuery extends { readonly ownerId: OwnerId }> = Omit<TQuery, "ownerId">;
