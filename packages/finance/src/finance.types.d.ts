export type OwnerId = string;
export type CurrencyCode = string;
export type DecimalString = string;
export type IsoDate = string;
export type IsoDateTime = string;

export interface DateRange {
  readonly startsOn: IsoDate;
  readonly endsOn: IsoDate;
}

export type FinancialPeriod = "day" | "week" | "month" | "quarter" | "year" | "custom";
export type FinancialFrequency = "once" | "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
export type FinancialStatus = "draft" | "active" | "paused" | "completed" | "closed" | "archived" | "cancelled";
export type FinancialSource = "manual" | "import" | "system";

export interface FinancialMetadata {
  readonly ownerId: OwnerId;
  readonly source: FinancialSource;
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}

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
