import { z } from "@aperture/validation";

const DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATE_TIME_PATTERN = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,9})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
const FISCAL_YEAR_PATTERN = /^(\d{4})-(\d{2})$/;

function isCalendarDate(value: string): boolean {
  const match = ISO_DATE_PATTERN.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function isIsoDateTime(value: string): boolean {
  const match = ISO_DATE_TIME_PATTERN.exec(value);
  return match !== null && isCalendarDate(match[1] ?? "");
}

function isConsecutiveFiscalYear(value: string): boolean {
  const match = FISCAL_YEAR_PATTERN.exec(value);
  if (!match) return false;
  const startYear = Number(match[1]);
  const expectedEnd = String((startYear + 1) % 100).padStart(2, "0");
  return match[2] === expectedEnd;
}

export const financeDecimalStringSchema = z
  .string()
  .regex(DECIMAL_PATTERN, "Expected a plain base-10 decimal string without exponent notation");

export const financeIdentifierSchema = z
  .string()
  .regex(IDENTIFIER_PATTERN, "Expected a non-empty identifier containing only safe identifier characters");

export const financeCurrencyCodeSchema = z
  .string()
  .regex(/^[A-Z]{3}$/, "Expected an uppercase three-letter currency code");

export const financeIsoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Expected an ISO calendar date")
  .refine(isCalendarDate, "Expected a valid calendar date");

export const financeIsoDateTimeSchema = z
  .string()
  .regex(ISO_DATE_TIME_PATTERN, "Expected an ISO timestamp with an explicit UTC offset")
  .refine(isIsoDateTime, "Expected a valid ISO timestamp");

export const financeFiscalYearSchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/, "Expected a fiscal year in YYYY-YY form")
  .refine(isConsecutiveFiscalYear, "Fiscal year end must follow its start year");

export const financeTextSchema = z.string().trim().min(1).max(4_096);
export const financeVersionSchema = z.string().trim().min(1).max(64);
export const financeCursorSchema = z.string().trim().min(1).max(1_024);
export const financePositiveIntegerSchema = z.number().int().positive().finite();
export const financeNonNegativeIntegerSchema = z.number().int().nonnegative().finite();

export function compareIsoDateTimes(left: string, right: string): number {
  const leftFraction = /\.(\d+)(?=Z|[+-])/.exec(left)?.[1]?.padEnd(9, "0") ?? "000000000";
  const rightFraction = /\.(\d+)(?=Z|[+-])/.exec(right)?.[1]?.padEnd(9, "0") ?? "000000000";
  const leftSecond = Date.parse(left.replace(/\.\d+(?=Z|[+-])/, ""));
  const rightSecond = Date.parse(right.replace(/\.\d+(?=Z|[+-])/, ""));
  if (leftSecond !== rightSecond) return leftSecond - rightSecond;
  return leftFraction < rightFraction ? -1 : leftFraction > rightFraction ? 1 : 0;
}

export function hasDefinedProperty(value: Readonly<Record<string, unknown>>): boolean {
  return Object.values(value).some((entry) => entry !== undefined);
}
