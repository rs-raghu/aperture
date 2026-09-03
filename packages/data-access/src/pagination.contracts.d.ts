export interface PaginationRequest {
  readonly cursor?: string;
  readonly limit?: number;
}

export interface PaginatedResult<Item> {
  readonly items: readonly Item[];
  readonly nextCursor?: string;
  readonly totalCount?: number;
}
