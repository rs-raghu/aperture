import { z } from "@aperture/validation";
import { entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateSchema, optionalNotesSchema, ownerIdSchema, paginationInputSchema, sortDirectionSchema } from "../education.types.js";
import { courseIdSchema } from "../courses/course.types.js";

export const attendanceRecordIdSchema = identifierSchema;
export type AttendanceRecordId = z.infer<typeof attendanceRecordIdSchema>;
export const attendanceStatuses = ["present", "absent", "late", "excused", "cancelled"] as const;
export const attendanceStatusSchema = z.enum(attendanceStatuses);
export type AttendanceStatus = z.infer<typeof attendanceStatusSchema>;
export const attendanceSources = ["manual", "institution", "imported"] as const;
export const attendanceSourceSchema = z.enum(attendanceSources);
export type AttendanceSource = z.infer<typeof attendanceSourceSchema>;

const attendanceFields = {
  courseId: courseIdSchema,
  sessionDate: isoDateSchema,
  status: attendanceStatusSchema,
  source: attendanceSourceSchema,
  scheduledDurationMinutes: z.number().int().min(0).optional(),
  attendedDurationMinutes: z.number().int().min(0).optional(),
  notes: optionalNotesSchema,
};

export const attendanceRecordSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: attendanceRecordIdSchema,
  ...attendanceFields,
});
export type AttendanceRecord = z.infer<typeof attendanceRecordSchema>;

export const createAttendanceInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...attendanceFields,
});
export type CreateAttendanceInput = z.infer<typeof createAttendanceInputSchema>;
export type RecordAttendanceInput = CreateAttendanceInput;
export const recordAttendanceInputSchema = createAttendanceInputSchema;

export const updateAttendanceInputSchema = z.strictObject({
  id: attendanceRecordIdSchema,
  courseId: attendanceFields.courseId.optional(),
  sessionDate: attendanceFields.sessionDate.optional(),
  status: attendanceFields.status.optional(),
  source: attendanceFields.source.optional(),
  scheduledDurationMinutes: attendanceFields.scheduledDurationMinutes,
  attendedDurationMinutes: attendanceFields.attendedDurationMinutes,
  notes: attendanceFields.notes,
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.");
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceInputSchema>;

export const attendanceQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  courseId: courseIdSchema.optional(),
  status: attendanceStatusSchema.optional(),
  source: attendanceSourceSchema.optional(),
  dateFrom: isoDateSchema.optional(),
  dateTo: isoDateSchema.optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type AttendanceQuery = z.infer<typeof attendanceQuerySchema>;

export const attendanceByCourseQuerySchema = attendanceQuerySchema.extend({ courseId: courseIdSchema }).strict();
export type AttendanceByCourseQuery = z.infer<typeof attendanceByCourseQuerySchema>;
