import type { RepositoryContext } from "./data-access.types.js";

export type DataChangeType = "created" | "updated" | "deleted";

export interface DataChange<Entity> {
  readonly type: DataChangeType;
  readonly entityId: string;
  readonly entity?: Entity;
}

export type DataChangeListener<Entity> = (change: DataChange<Entity>) => void;
export type DataSubscription = () => void;

export interface SubscriptionContract<Entity> {
  subscribe(
    context: RepositoryContext,
    listener: DataChangeListener<Entity>
  ): Promise<DataSubscription>;
}
