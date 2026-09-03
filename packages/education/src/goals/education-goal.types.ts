import { z } from "@aperture/validation";
import { entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateSchema, isoDateTimeSchema, nonNegativeDecimalStringSchema, optionalDescriptionSchema, ownerIdSchema, paginationInputSchema, shortTextSchema, sortDirectionSchema, titleSchema } from "../education.types.js";
import { courseIdSchema } from "../courses/course.types.js";
import { programIdSchema } from "../programs/program.types.js";
import { semesterIdSchema } from "../semesters/semester.types.js";

export const educationGoalIdSchema = identifierSchema;
export type EducationGoalId = z.infer<typeof educationGoalIdSchema>;
export const educationGoalTypes = ["completion", "grade", "study_time", "credits", "custom"] as const;
export const educationGoalTypeSchema = z.enum(educationGoalTypes);
export type EducationGoalType = z.infer<typeof educationGoalTypeSchema>;
export const educationGoalStatuses = ["planned", "active", "completed", "archived"] as const;
export const educationGoalStatusSchema = z.enum(educationGoalStatuses);
export type EducationGoalStatus = z.infer<typeof educationGoalStatusSchema>;

const goalFields = {
  programId: programIdSchema.optional(),
  semesterId: semesterIdSchema.optional(),
  courseId: courseIdSchema.optional(),
  title: titleSchema,
  description: optionalDescriptionSchema,
  goalType: educationGoalTypeSchema,
  targetValue: nonNegativeDecimalStringSchema.optional(),
  targetUnit: shortTextSchema.optional(),
  currentValue: nonNegativeDecimalStringSchema.optional(),
  startsOn: isoDateSchema.optional(),
  targetDate: isoDateSchema.optional(),
  completedAt: isoDateTimeSchema.optional(),
  status: educationGoalStatusSchema,
};
const relationshipIsValid = (value: { programId?: string | undefined; semesterId?: string | undefined; courseId?: string | undefined }): boolean =>
  [value.programId, value.semesterId, value.courseId].filter((item) => item !== undefined).length <= 1;
const datesAreOrdered = (value: { startsOn?: string | undefined; targetDate?: string | undefined }): boolean =>
  value.startsOn === undefined || value.targetDate === undefined || value.targetDate >= value.startsOn;

export const educationGoalSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: educationGoalIdSchema,
  ...goalFields,
}).refine(relationshipIsValid, { message: "A goal may reference at most one academic scope.", path: ["programId"] })
  .refine(datesAreOrdered, { message: "Target date cannot be earlier than start date.", path: ["targetDate"] });
export type EducationGoal = z.infer<typeof educationGoalSchema>;

export const createEducationGoalInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...goalFields,
}).refine(relationshipIsValid, { message: "A goal may reference at most one academic scope.", path: ["programId"] })
  .refine(datesAreOrdered, { message: "Target date cannot be earlier than start date.", path: ["targetDate"] });
export type CreateEducationGoalInput = z.infer<typeof createEducationGoalInputSchema>;

export const updateEducationGoalInputSchema = z.strictObject({
  id: educationGoalIdSchema,
  programId: goalFields.programId,
  semesterId: goalFields.semesterId,
  courseId: goalFields.courseId,
  title: goalFields.title.optional(),
  description: goalFields.description,
  goalType: goalFields.goalType.optional(),
  targetValue: goalFields.targetValue,
  targetUnit: goalFields.targetUnit,
  currentValue: goalFields.currentValue,
  startsOn: goalFields.startsOn,
  targetDate: goalFields.targetDate,
  completedAt: goalFields.completedAt,
  status: goalFields.status.optional(),
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.")
  .refine(relationshipIsValid, { message: "A goal update may reference at most one academic scope.", path: ["programId"] })
  .refine(datesAreOrdered, { message: "Target date cannot be earlier than start date when both are supplied.", path: ["targetDate"] });
export type UpdateEducationGoalInput = z.infer<typeof updateEducationGoalInputSchema>;

export const educationGoalQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  programId: programIdSchema.optional(),
  semesterId: semesterIdSchema.optional(),
  courseId: courseIdSchema.optional(),
  goalType: educationGoalTypeSchema.optional(),
  status: educationGoalStatusSchema.optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
}).refine(relationshipIsValid, { message: "A goal query may reference at most one academic scope.", path: ["programId"] });
export type EducationGoalQuery = z.infer<typeof educationGoalQuerySchema>;
export type EducationGoalListQuery = EducationGoalQuery;
