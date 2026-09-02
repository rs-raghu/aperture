import type { FinancialMetadata, IsoDate } from "../finance.types.js";
import type { Money } from "../money.types.js";

export type NetWorthSnapshotId = string;

export interface NetWorthSnapshot extends FinancialMetadata {
  readonly id: NetWorthSnapshotId;
  readonly snapshotDate: IsoDate;
  readonly totalAssets: Money;
  readonly totalLiabilities: Money;
  readonly netWorth: Money;
}
