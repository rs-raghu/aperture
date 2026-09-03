import { z } from "@aperture/validation";

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME_WITH_ZONE_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/;
const DECIMAL_PATTERN = /^-?(?:0|[1-9]\d*)(?:\.\d+)?$/;
const NON_NEGATIVE_DECIMAL_PATTERN = /^(?:0|[1-9]\d*)(?:\.\d+)?$/;

function isCalendarDate(value: string): boolean {
  const [yearText, monthText, dayText] = value.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function hasAtLeastOneDefinedValue(
  value: Readonly<Record<string, unknown>>,
  excludedKeys: readonly string[] = ["id"],
): boolean {
  return Object.entries(value).some(
    ([key, fieldValue]) =>
      !excludedKeys.includes(key) && fieldValue !== undefined,
  );
}

export const identifierSchema = z.string().uuid();
export const ownerIdSchema = identifierSchema;
export type OwnerId = z.infer<typeof ownerIdSchema>;

export const isoDateSchema = z
  .string()
  .regex(ISO_DATE_PATTERN, "Expected a date in YYYY-MM-DD format.")
  .refine(isCalendarDate, "Expected a valid calendar date.");
export type IsoDateString = z.infer<typeof isoDateSchema>;

export const isoDateTimeSchema = z
  .string()
  .regex(
    ISO_DATE_TIME_WITH_ZONE_PATTERN,
    "Expected an RFC 3339 timestamp with an explicit timezone.",
  )
  .refine(
    (value) =>
      isCalendarDate(value.slice(0, 10)) &&
      Number.isFinite(Date.parse(value)),
    "Expected a valid timestamp.",
  );
export type IsoDateTimeString = z.infer<typeof isoDateTimeSchema>;

export const titleSchema = z.string().trim().min(1).max(200);
export const optionalDescriptionSchema = z.string().trim().max(4000).optional();
export const shortTextSchema = z.string().trim().min(1).max(200);
export const optionalNotesSchema = z.string().trim().max(8000).optional();
export const optionalUrlSchema = z.string().url().max(2048).optional();

export const decimalStringSchema = z
  .string()
  .regex(DECIMAL_PATTERN, "Expected a normalized decimal string.");
export type DecimalString = z.infer<typeof decimalStringSchema>;

export const nonNegativeDecimalStringSchema = z
  .string()
  .regex(NON_NEGATIVE_DECIMAL_PATTERN, "Expected a non-negative normalized decimal string.");

export const percentageStringSchema = nonNegativeDecimalStringSchema.refine(
  (value) => Number(value) <= 100,
  "Expected a percentage from 0 through 100.",
);
export type PercentageString = z.infer<typeof percentageStringSchema>;

export const creditValueSchema = nonNegativeDecimalStringSchema.refine(
  (value) => Number(value) > 0,
  "Expected credits greater than zero.",
);
export type CreditValue = z.infer<typeof creditValueSchema>;

export const gradePointValueSchema = nonNegativeDecimalStringSchema;
export type GradePointValue = z.infer<typeof gradePointValueSchema>;

export const gradeScaleSchema = z.strictObject({
  minimum: gradePointValueSchema,
  maximum: gradePointValueSchema,
  label: shortTextSchema.optional(),
}).refine(
  ({ minimum, maximum }) => Number(maximum) >= Number(minimum),
  { message: "Grade-scale maximum cannot be lower than its minimum.", path: ["maximum"] },
);
export type GradeScale = z.infer<typeof gradeScaleSchema>;

export const academicStatuses = [
  "planned",
  "active",
  "completed",
  "archived",
] as const;
export const academicStatusSchema = z.enum(academicStatuses);
export type AcademicStatus = z.infer<typeof academicStatusSchema>;

export const recordStatuses = ["active", "archived"] as const;
export const recordStatusSchema = z.enum(recordStatuses);
export type RecordStatus = z.infer<typeof recordStatusSchema>;

export const sortDirections = ["ascending", "descending"] as const;
export const sortDirectionSchema = z.enum(sortDirections);
export type SortDirection = z.infer<typeof sortDirectionSchema>;

export const entityMetadataSchema = z.strictObject({
  ownerId: ownerIdSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});
export type EntityMetadata = z.infer<typeof entityMetadataSchema>;

export const dateRangeSchema = z.strictObject({
  startsOn: isoDateSchema,
  endsOn: isoDateSchema,
}).refine(
  ({ startsOn, endsOn }) => endsOn >= startsOn,
  { message: "End date cannot be earlier than start date.", path: ["endsOn"] },
);
export type DateRange = z.infer<typeof dateRangeSchema>;

export const paginationInputSchema = z.strictObject({
  cursor: z.string().min(1).max(500).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export type PaginationInput = z.infer<typeof paginationInputSchema>;
export type PageRequest = PaginationInput;

export interface PageResult<TEntity> {
  readonly items: readonly TEntity[];
  readonly nextCursor?: string;
}

export const ownerQuerySchema = paginationInputSchema.extend({
  ownerId: ownerIdSchema,
}).strict();
export type OwnerQuery = z.infer<typeof ownerQuerySchema>;

export const educationEntityStatuses = [
  "active",
  "completed",
  "archived",
] as const;
export const educationEntityStatusSchema = z.enum(educationEntityStatuses);
export type EducationEntityStatus = z.infer<typeof educationEntityStatusSchema>;
