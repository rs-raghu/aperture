import { z } from "@aperture/validation";
import { textSchema } from "./internal/primitives.js";
import { orderedInstants } from "./internal/validation.helpers.js";

// Phase 2 IDs are opaque strings, not UUID-branded types. Accept stable tokens,
// including UUIDs, without generating IDs or assuming a storage provider.
export const identifierSchema = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/, "Enter a non-empty identifier without whitespace or unsupported characters.");
export const ownerIdSchema = identifierSchema;
export type OwnerId = z.infer<typeof ownerIdSchema>;

function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const year = Number(value.slice(0, 4));
  const month = Number(value.slice(5, 7));
  const day = Number(value.slice(8, 10));
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= (days[month - 1] ?? 0);
}

export const isoDateStringSchema = z.string().refine(isCalendarDate, "Enter a valid calendar date in YYYY-MM-DD format.");
export const isoDateSchema = isoDateStringSchema;
export type IsoDateString = z.infer<typeof isoDateStringSchema>;

export const isoDateTimeStringSchema = z.string().refine((value) => {
  const match = /^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d{1,9})?(Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/.exec(value);
  return match !== null && isCalendarDate(match[1] ?? "") && Number.isFinite(Date.parse(value));
}, "Enter a valid RFC 3339 timestamp with an explicit timezone.");
export const isoDateTimeSchema = isoDateTimeStringSchema;
export type IsoDateTimeString = z.infer<typeof isoDateTimeStringSchema>;

// Preserve caller precision: no Number coercion, trimming, or normalization.
export const decimalStringSchema = z.string().regex(/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/, "Enter a finite plain decimal string.");
export type DecimalString = z.infer<typeof decimalStringSchema>;

export const entityMetadataSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeStringSchema,
  updatedAt: isoDateTimeStringSchema,
}).refine(({ createdAt, updatedAt }) => orderedInstants(createdAt, updatedAt), {
  message: "Update time must not be earlier than creation time.", path: ["updatedAt"],
}).readonly();
export type EntityMetadata = Readonly<z.infer<typeof entityMetadataSchema>>;

export const dateRangeSchema = z.strictObject({
  startsAt: isoDateTimeStringSchema,
  endsAt: isoDateTimeStringSchema,
}).refine(({ startsAt, endsAt }) => orderedInstants(startsAt, endsAt), {
  message: "End time must not be earlier than start time.", path: ["endsAt"],
}).readonly();
export type DateRange = Readonly<z.infer<typeof dateRangeSchema>>;

export const pageRequestSchema = z.strictObject({
  cursor: textSchema.optional(),
  limit: z.number().finite().int().min(1).max(100).optional(),
}).readonly();
export type PageRequest = Readonly<z.infer<typeof pageRequestSchema>>;
export function pageResultSchema<TEntity>(itemSchema: z.ZodType<TEntity>) {
  return z.strictObject({ items: z.array(itemSchema).readonly(), nextCursor: textSchema.optional() }).readonly();
}
export type PageResult<TEntity> = Readonly<z.infer<ReturnType<typeof pageResultSchema<TEntity>>>>;
export const ownerQuerySchema = pageRequestSchema.unwrap().extend({ ownerId: ownerIdSchema }).strict().readonly();
export type OwnerQuery = Readonly<z.infer<typeof ownerQuerySchema>>;
export const measurementSystemSchema = z.enum(["metric", "imperial"]);
export type MeasurementSystem = z.infer<typeof measurementSystemSchema>;
export const recordStatusSchema = z.enum(["active", "archived"]);
export type RecordStatus = z.infer<typeof recordStatusSchema>;
