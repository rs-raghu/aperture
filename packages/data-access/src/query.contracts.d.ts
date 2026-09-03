export type QueryOperator =
  | "equals"
  | "not-equals"
  | "greater-than"
  | "greater-than-or-equal"
  | "less-than"
  | "less-than-or-equal"
  | "in"
  | "contains";

export interface QueryFilter<Value = unknown> {
  readonly field: string;
  readonly operator: QueryOperator;
  readonly value: Value;
}

export type SortDirection = "ascending" | "descending";

export interface QuerySort {
  readonly field: string;
  readonly direction: SortDirection;
}

export interface QuerySpecification {
  readonly filters?: readonly QueryFilter[];
  readonly sorting?: readonly QuerySort[];
}
