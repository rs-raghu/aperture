import { z } from "@aperture/validation";
import { entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateTimeSchema, nonNegativeDecimalStringSchema, optionalNotesSchema, ownerIdSchema, paginationInputSchema, percentageStringSchema, sortDirectionSchema, titleSchema } from "../education.types.js";
import { courseIdSchema } from "../courses/course.types.js";
import { semesterIdSchema } from "../semesters/semester.types.js";

export const examIdSchema = identifierSchema;
export type ExamId = z.infer<typeof examIdSchema>;
export const examTypes = ["quiz", "midterm", "final", "practical", "oral", "other"] as const;
export const examTypeSchema = z.enum(examTypes);
export type ExamType = z.infer<typeof examTypeSchema>;
export const examStatuses = ["scheduled", "completed", "cancelled"] as const;
export const examStatusSchema = z.enum(examStatuses);
export type ExamStatus = z.infer<typeof examStatusSchema>;

const examFields = {
  courseId: courseIdSchema,
  semesterId: semesterIdSchema.optional(),
  title: titleSchema,
  examType: examTypeSchema,
  scheduledStartsAt: isoDateTimeSchema,
  scheduledEndsAt: isoDateTimeSchema,
  location: z.string().trim().min(1).max(500).optional(),
  maximumScore: nonNegativeDecimalStringSchema.optional(),
  weightPercentage: percentageStringSchema.optional(),
  status: examStatusSchema,
  notes: optionalNotesSchema,
};
const timesAreOrdered = (value: { scheduledStartsAt?: string | undefined; scheduledEndsAt?: string | undefined }): boolean =>
  value.scheduledStartsAt === undefined || value.scheduledEndsAt === undefined || value.scheduledEndsAt >= value.scheduledStartsAt;

export const examSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: examIdSchema,
  ...examFields,
}).refine(timesAreOrdered, { message: "Scheduled end cannot be earlier than scheduled start.", path: ["scheduledEndsAt"] });
export type Exam = z.infer<typeof examSchema>;

export const createExamInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...examFields,
}).refine(timesAreOrdered, { message: "Scheduled end cannot be earlier than scheduled start.", path: ["scheduledEndsAt"] });
export type CreateExamInput = z.infer<typeof createExamInputSchema>;

export const updateExamInputSchema = z.strictObject({
  id: examIdSchema,
  courseId: examFields.courseId.optional(),
  semesterId: examFields.semesterId,
  title: examFields.title.optional(),
  examType: examFields.examType.optional(),
  scheduledStartsAt: examFields.scheduledStartsAt.optional(),
  scheduledEndsAt: examFields.scheduledEndsAt.optional(),
  location: examFields.location,
  maximumScore: examFields.maximumScore,
  weightPercentage: examFields.weightPercentage,
  status: examFields.status.optional(),
  notes: examFields.notes,
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.")
  .refine(timesAreOrdered, { message: "Scheduled end cannot be earlier than scheduled start when both are supplied.", path: ["scheduledEndsAt"] });
export type UpdateExamInput = z.infer<typeof updateExamInputSchema>;

export const examQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  courseId: courseIdSchema.optional(),
  examType: examTypeSchema.optional(),
  status: examStatusSchema.optional(),
  startsAfter: isoDateTimeSchema.optional(),
  startsBefore: isoDateTimeSchema.optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type ExamQuery = z.infer<typeof examQuerySchema>;
export type ExamListQuery = ExamQuery;

export const upcomingExamsQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  courseId: courseIdSchema.optional(),
  startsBefore: isoDateTimeSchema.optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export type UpcomingExamsQuery = z.infer<typeof upcomingExamsQuerySchema>;
