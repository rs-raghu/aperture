import type { FinancialMetadata, IsoDate } from "../finance.types.js";
import type { Money } from "../money.types.js";
import type { TaxProfileId } from "./tax-profile.types.js";

export type TaxRecordId = string;

export interface TaxRecord extends FinancialMetadata {
  readonly id: TaxRecordId;
  readonly taxProfileId: TaxProfileId;
  readonly financialYear: string;
  readonly recordType: string;
  readonly amount: Money;
  readonly recordedOn: IsoDate;
}
