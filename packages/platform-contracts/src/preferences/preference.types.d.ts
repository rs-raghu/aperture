import type { DecimalString, PlatformOwnerId } from "../platform.types.js";

export type LocaleCode = string;
export type TimeZoneId = string;
export type CurrencyCode = string;
export type DateFormat = "locale-default" | "day-month-year" | "month-day-year" | "year-month-day";
export type WeekStartDay = "monday" | "sunday";
export type MeasurementSystem = "metric" | "imperial";
export type ThemePreference = "system" | "light" | "dark";

export interface FinancialYearPreference {
  readonly startMonth: number;
  readonly startDay: number;
}

export interface UserPreferences {
  readonly ownerId: PlatformOwnerId;
  readonly locale: LocaleCode;
  readonly timeZone: TimeZoneId;
  readonly currency: CurrencyCode;
  readonly dateFormat: DateFormat;
  readonly weekStartDay: WeekStartDay;
  readonly measurementSystem: MeasurementSystem;
  readonly theme: ThemePreference;
  readonly financialYear: FinancialYearPreference;
  readonly gpaScale: DecimalString;
}

export type UserPreferenceUpdate = Partial<Omit<UserPreferences, "ownerId">>;
