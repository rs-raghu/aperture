export type PlatformOwnerId = string;
export type IsoDateString = string;
export type IsoDateTimeString = string;
export type DecimalString = string;
export type Unsubscribe = () => void;

export interface ListQuery {
  readonly ownerId: PlatformOwnerId;
  readonly cursor?: string;
  readonly limit?: number;
}

export interface PageResult<Item> {
  readonly items: readonly Item[];
  readonly nextCursor?: string;
}
