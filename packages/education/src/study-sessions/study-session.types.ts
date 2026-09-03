import { z } from "@aperture/validation";
import { entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateTimeSchema, optionalNotesSchema, ownerIdSchema, paginationInputSchema, sortDirectionSchema, titleSchema } from "../education.types.js";
import { courseIdSchema } from "../courses/course.types.js";
import { topicIdSchema } from "../topics/topic.types.js";

export const studySessionIdSchema = identifierSchema;
export type StudySessionId = z.infer<typeof studySessionIdSchema>;
export const studySessionStatuses = ["scheduled", "in_progress", "paused", "completed", "cancelled"] as const;
export const studySessionStatusSchema = z.enum(studySessionStatuses);
export type StudySessionStatus = z.infer<typeof studySessionStatusSchema>;
export const studySessionMethods = ["reading", "practice", "review", "lecture", "group", "other"] as const;
export const studySessionMethodSchema = z.enum(studySessionMethods);
export type StudySessionMethod = z.infer<typeof studySessionMethodSchema>;

const studySessionFields = {
  courseId: courseIdSchema,
  topicId: topicIdSchema.optional(),
  title: titleSchema,
  plannedStartsAt: isoDateTimeSchema,
  plannedEndsAt: isoDateTimeSchema.optional(),
  actualStartsAt: isoDateTimeSchema.optional(),
  actualEndsAt: isoDateTimeSchema.optional(),
  plannedDurationMinutes: z.number().int().min(0).optional(),
  actualDurationMinutes: z.number().int().min(0).optional(),
  method: studySessionMethodSchema,
  focusRating: z.number().int().min(1).max(5).optional(),
  notes: optionalNotesSchema,
  status: studySessionStatusSchema,
};
const timesAreOrdered = (value: { plannedStartsAt?: string | undefined; plannedEndsAt?: string | undefined; actualStartsAt?: string | undefined; actualEndsAt?: string | undefined }): boolean =>
  (value.plannedStartsAt === undefined || value.plannedEndsAt === undefined || value.plannedEndsAt >= value.plannedStartsAt) &&
  (value.actualStartsAt === undefined || value.actualEndsAt === undefined || value.actualEndsAt >= value.actualStartsAt);

export const studySessionSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: studySessionIdSchema,
  ...studySessionFields,
}).refine(timesAreOrdered, { message: "Session end cannot be earlier than its corresponding start.", path: ["plannedEndsAt"] });
export type StudySession = z.infer<typeof studySessionSchema>;

export const createStudySessionInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...studySessionFields,
}).refine(timesAreOrdered, { message: "Session end cannot be earlier than its corresponding start.", path: ["plannedEndsAt"] });
export type CreateStudySessionInput = z.infer<typeof createStudySessionInputSchema>;
export type ScheduleStudySessionInput = CreateStudySessionInput;
export const scheduleStudySessionInputSchema = createStudySessionInputSchema;

export const updateStudySessionInputSchema = z.strictObject({
  id: studySessionIdSchema,
  courseId: studySessionFields.courseId.optional(),
  topicId: studySessionFields.topicId,
  title: studySessionFields.title.optional(),
  plannedStartsAt: studySessionFields.plannedStartsAt.optional(),
  plannedEndsAt: studySessionFields.plannedEndsAt,
  actualStartsAt: studySessionFields.actualStartsAt,
  actualEndsAt: studySessionFields.actualEndsAt,
  plannedDurationMinutes: studySessionFields.plannedDurationMinutes,
  actualDurationMinutes: studySessionFields.actualDurationMinutes,
  method: studySessionFields.method.optional(),
  focusRating: studySessionFields.focusRating,
  notes: studySessionFields.notes,
  status: studySessionFields.status.optional(),
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.")
  .refine(timesAreOrdered, { message: "Session end cannot be earlier than its corresponding start when both are supplied.", path: ["plannedEndsAt"] });
export type UpdateStudySessionInput = z.infer<typeof updateStudySessionInputSchema>;

export const studySessionQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  courseId: courseIdSchema.optional(),
  topicId: topicIdSchema.optional(),
  status: studySessionStatusSchema.optional(),
  method: studySessionMethodSchema.optional(),
  startsAfter: isoDateTimeSchema.optional(),
  startsBefore: isoDateTimeSchema.optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type StudySessionQuery = z.infer<typeof studySessionQuerySchema>;
export type StudySessionListQuery = StudySessionQuery;

export const studySessionsByCourseQuerySchema = studySessionQuerySchema.extend({ courseId: courseIdSchema }).strict();
export type StudySessionsByCourseQuery = z.infer<typeof studySessionsByCourseQuerySchema>;
