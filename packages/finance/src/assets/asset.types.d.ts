import type { FinancialMetadata, FinancialStatus, IsoDate } from "../finance.types.js";
import type { Money } from "../money.types.js";

export type AssetId = string;
export type AssetType = "cash" | "property" | "vehicle" | "investment" | "valuable" | "other";

export interface Asset extends FinancialMetadata {
  readonly id: AssetId;
  readonly name: string;
  readonly assetType: AssetType;
  readonly currentValue: Money;
  readonly valuedOn: IsoDate;
  readonly status: FinancialStatus;
}
