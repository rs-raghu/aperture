export type OwnerId = string;
export type IsoDateString = string;
export type IsoDateTimeString = string;

export interface EntityMetadata {
  readonly ownerId: OwnerId;
  readonly createdAt: IsoDateTimeString;
  readonly updatedAt: IsoDateTimeString;
}

export interface DateRange {
  readonly startsOn: IsoDateString;
  readonly endsOn: IsoDateString;
}

export type SortDirection = "ascending" | "descending";

export interface PageRequest {
  readonly cursor?: string;
  readonly limit?: number;
}

export interface PageResult<TEntity> {
  readonly items: readonly TEntity[];
  readonly nextCursor?: string;
}

export interface OwnerQuery extends PageRequest {
  readonly ownerId: OwnerId;
}

export type EducationEntityStatus = "active" | "completed" | "archived";
