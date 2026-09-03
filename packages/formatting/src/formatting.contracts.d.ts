import type {
  CurrencyCode,
  DecimalFormattingOptions,
  DecimalString,
  FormattingOptions,
  IsoDateString,
  IsoDateTimeString,
  UnitValue
} from "./formatting.types.js";

export declare function formatCurrency(
  value: DecimalString,
  currency: CurrencyCode,
  options?: DecimalFormattingOptions
): string;
export declare function formatDecimal(
  value: DecimalString,
  options?: DecimalFormattingOptions
): string;
export declare function formatPercentage(
  value: DecimalString,
  options?: DecimalFormattingOptions
): string;
export declare function formatDate(value: IsoDateString, options?: FormattingOptions): string;
export declare function formatDateTime(value: IsoDateTimeString, options?: FormattingOptions): string;
export declare function formatDuration(value: UnitValue, options?: FormattingOptions): string;
export declare function formatDistance(value: UnitValue, options?: FormattingOptions): string;
export declare function formatWeight(value: UnitValue, options?: FormattingOptions): string;
export declare function formatPace(value: UnitValue, options?: FormattingOptions): string;
