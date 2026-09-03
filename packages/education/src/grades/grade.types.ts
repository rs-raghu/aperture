import { z } from "@aperture/validation";
import { entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateTimeSchema, nonNegativeDecimalStringSchema, optionalNotesSchema, ownerIdSchema, paginationInputSchema, percentageStringSchema, sortDirectionSchema, titleSchema } from "../education.types.js";
import { assignmentIdSchema } from "../assignments/assignment.types.js";
import { courseIdSchema } from "../courses/course.types.js";
import { examIdSchema } from "../exams/exam.types.js";
import { semesterIdSchema } from "../semesters/semester.types.js";

export const gradeIdSchema = identifierSchema;
export type GradeId = z.infer<typeof gradeIdSchema>;
export const gradeSourceTypes = ["assignment", "exam", "manual"] as const;
export const gradeSourceTypeSchema = z.enum(gradeSourceTypes);
export type GradeSourceType = z.infer<typeof gradeSourceTypeSchema>;

const gradeFields = {
  courseId: courseIdSchema,
  semesterId: semesterIdSchema.optional(),
  sourceType: gradeSourceTypeSchema,
  assignmentId: assignmentIdSchema.optional(),
  examId: examIdSchema.optional(),
  title: titleSchema,
  scoreEarned: nonNegativeDecimalStringSchema,
  maximumScore: nonNegativeDecimalStringSchema,
  gradePoints: nonNegativeDecimalStringSchema.optional(),
  letterGrade: z.string().trim().min(1).max(20).optional(),
  weightPercentage: percentageStringSchema.optional(),
  recordedAt: isoDateTimeSchema,
  notes: optionalNotesSchema,
};
const sourceRelationshipIsValid = (value: { sourceType: GradeSourceType; assignmentId?: string | undefined; examId?: string | undefined }): boolean => {
  const relationshipCount = Number(value.assignmentId !== undefined) + Number(value.examId !== undefined);
  if (relationshipCount > 1) return false;
  if (value.sourceType === "assignment") return value.assignmentId !== undefined;
  if (value.sourceType === "exam") return value.examId !== undefined;
  return relationshipCount === 0;
};

export const gradeSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: gradeIdSchema,
  ...gradeFields,
}).refine(sourceRelationshipIsValid, { message: "Grade source and relationship fields conflict.", path: ["sourceType"] });
export type Grade = z.infer<typeof gradeSchema>;

export const createGradeInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...gradeFields,
}).refine(sourceRelationshipIsValid, { message: "Grade source and relationship fields conflict.", path: ["sourceType"] });
export type CreateGradeInput = z.infer<typeof createGradeInputSchema>;
export type RecordGradeInput = CreateGradeInput;
export const recordGradeInputSchema = createGradeInputSchema;

export const updateGradeInputSchema = z.strictObject({
  id: gradeIdSchema,
  courseId: gradeFields.courseId.optional(),
  semesterId: gradeFields.semesterId,
  sourceType: gradeFields.sourceType.optional(),
  assignmentId: gradeFields.assignmentId,
  examId: gradeFields.examId,
  title: gradeFields.title.optional(),
  scoreEarned: gradeFields.scoreEarned.optional(),
  maximumScore: gradeFields.maximumScore.optional(),
  gradePoints: gradeFields.gradePoints,
  letterGrade: gradeFields.letterGrade,
  weightPercentage: gradeFields.weightPercentage,
  recordedAt: gradeFields.recordedAt.optional(),
  notes: gradeFields.notes,
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.")
  .refine(
    ({ assignmentId, examId }) =>
      Number(assignmentId !== undefined) + Number(examId !== undefined) <= 1,
    { message: "A grade update cannot reference both an assignment and an exam.", path: ["assignmentId"] },
  );
export type UpdateGradeInput = z.infer<typeof updateGradeInputSchema>;

export const gradeQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  courseId: courseIdSchema.optional(),
  semesterId: semesterIdSchema.optional(),
  sourceType: gradeSourceTypeSchema.optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type GradeQuery = z.infer<typeof gradeQuerySchema>;

export const gradesByCourseQuerySchema = gradeQuerySchema.extend({ courseId: courseIdSchema }).strict();
export type GradesByCourseQuery = z.infer<typeof gradesByCourseQuerySchema>;
export const gradesBySemesterQuerySchema = gradeQuerySchema.extend({ semesterId: semesterIdSchema }).strict();
export type GradesBySemesterQuery = z.infer<typeof gradesBySemesterQuerySchema>;
