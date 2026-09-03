import type { OwnerId } from "../education.types.js";

export interface EducationOperationContext {
  readonly ownerId: OwnerId;
}

export type OwnerScopedInput<TInput extends { readonly ownerId: OwnerId }> = Omit<TInput, "ownerId">;
