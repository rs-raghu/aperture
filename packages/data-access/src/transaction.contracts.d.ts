import type { RepositoryContext } from "./data-access.types.js";

export type TransactionId = string;
export type TransactionState = "active" | "committed" | "rolled-back";

export interface TransactionContract {
  readonly id: TransactionId;
  readonly context: RepositoryContext;
  readonly state: TransactionState;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}
