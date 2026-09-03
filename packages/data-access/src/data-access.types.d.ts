export type DataRecordId = string;
export type DataOwnerId = string;
export type IsoDateTimeString = string;

export interface AuthenticatedOwnerContext {
  readonly ownerId: DataOwnerId;
  readonly userId: string;
  readonly sessionId: string;
}

export interface RepositoryContext {
  readonly owner: AuthenticatedOwnerContext;
  readonly requestId?: string;
  readonly transactionId?: string;
}

export interface CreateResult<Entity> {
  readonly entity: Entity;
  readonly createdAt: IsoDateTimeString;
}

export interface UpdateResult<Entity> {
  readonly entity: Entity;
  readonly updatedAt: IsoDateTimeString;
}

export interface DeleteResult {
  readonly id: DataRecordId;
  readonly deleted: boolean;
}
