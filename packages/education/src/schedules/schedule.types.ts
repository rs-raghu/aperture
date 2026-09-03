import { z } from "@aperture/validation";
import { entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateTimeSchema, optionalNotesSchema, ownerIdSchema, paginationInputSchema, sortDirectionSchema, titleSchema } from "../education.types.js";
import { courseIdSchema } from "../courses/course.types.js";

export const scheduleEntryIdSchema = identifierSchema;
export type ScheduleEntryId = z.infer<typeof scheduleEntryIdSchema>;
export const scheduleEntryTypes = ["class", "study", "exam", "assignment", "meeting", "other"] as const;
export const scheduleEntryTypeSchema = z.enum(scheduleEntryTypes);
export type ScheduleEntryType = z.infer<typeof scheduleEntryTypeSchema>;
export const scheduleEntryStatuses = ["scheduled", "completed", "cancelled"] as const;
export const scheduleEntryStatusSchema = z.enum(scheduleEntryStatuses);
export type ScheduleEntryStatus = z.infer<typeof scheduleEntryStatusSchema>;

export const recurrencePlaceholderSchema = z.strictObject({
  rule: z.string().trim().min(1).max(500),
  timeZone: z.string().trim().min(1).max(100).optional(),
});
export type RecurrencePlaceholder = z.infer<typeof recurrencePlaceholderSchema>;

const scheduleFields = {
  courseId: courseIdSchema.optional(),
  title: titleSchema,
  startsAt: isoDateTimeSchema,
  endsAt: isoDateTimeSchema,
  location: z.string().trim().min(1).max(500).optional(),
  entryType: scheduleEntryTypeSchema,
  recurrence: recurrencePlaceholderSchema.optional(),
  notes: optionalNotesSchema,
  status: scheduleEntryStatusSchema,
};
const timesAreOrdered = (value: { startsAt?: string | undefined; endsAt?: string | undefined }): boolean =>
  value.startsAt === undefined || value.endsAt === undefined || value.endsAt >= value.startsAt;

export const scheduleEntrySchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: scheduleEntryIdSchema,
  ...scheduleFields,
}).refine(timesAreOrdered, { message: "End cannot be earlier than start.", path: ["endsAt"] });
export type ScheduleEntry = z.infer<typeof scheduleEntrySchema>;

export const createScheduleEntryInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...scheduleFields,
}).refine(timesAreOrdered, { message: "End cannot be earlier than start.", path: ["endsAt"] });
export type CreateScheduleEntryInput = z.infer<typeof createScheduleEntryInputSchema>;

export const updateScheduleEntryInputSchema = z.strictObject({
  id: scheduleEntryIdSchema,
  courseId: scheduleFields.courseId,
  title: scheduleFields.title.optional(),
  startsAt: scheduleFields.startsAt.optional(),
  endsAt: scheduleFields.endsAt.optional(),
  location: scheduleFields.location,
  entryType: scheduleFields.entryType.optional(),
  recurrence: scheduleFields.recurrence,
  notes: scheduleFields.notes,
  status: scheduleFields.status.optional(),
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.")
  .refine(timesAreOrdered, { message: "End cannot be earlier than start when both are supplied.", path: ["endsAt"] });
export type UpdateScheduleEntryInput = z.infer<typeof updateScheduleEntryInputSchema>;

export const scheduleEntryQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  courseId: courseIdSchema.optional(),
  entryType: scheduleEntryTypeSchema.optional(),
  status: scheduleEntryStatusSchema.optional(),
  startsBefore: isoDateTimeSchema.optional(),
  endsAfter: isoDateTimeSchema.optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type ScheduleEntryQuery = z.infer<typeof scheduleEntryQuerySchema>;
export type ScheduleEntryListQuery = ScheduleEntryQuery;
