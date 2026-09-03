export type DecimalString = string;
export type IsoDateString = string;
export type IsoDateTimeString = string;
export type CurrencyCode = string;
export type LocaleCode = string;

export interface FormattingOptions {
  readonly locale?: LocaleCode;
}

export interface DecimalFormattingOptions extends FormattingOptions {
  readonly minimumFractionDigits?: number;
  readonly maximumFractionDigits?: number;
}

export interface UnitValue {
  readonly value: DecimalString;
  readonly unit: string;
}
