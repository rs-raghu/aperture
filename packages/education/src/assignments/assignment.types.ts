import { z } from "@aperture/validation";
import { entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateSchema, isoDateTimeSchema, nonNegativeDecimalStringSchema, optionalDescriptionSchema, optionalUrlSchema, ownerIdSchema, paginationInputSchema, percentageStringSchema, sortDirectionSchema, titleSchema } from "../education.types.js";
import { courseIdSchema } from "../courses/course.types.js";
import { topicIdSchema } from "../topics/topic.types.js";

export const assignmentIdSchema = identifierSchema;
export type AssignmentId = z.infer<typeof assignmentIdSchema>;
export const assignmentStatuses = ["draft", "assigned", "submitted", "completed", "cancelled"] as const;
export const assignmentStatusSchema = z.enum(assignmentStatuses);
export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;
export const assignmentPriorities = ["low", "normal", "high", "urgent"] as const;
export const assignmentPrioritySchema = z.enum(assignmentPriorities);
export type AssignmentPriority = z.infer<typeof assignmentPrioritySchema>;

const assignmentFields = {
  courseId: courseIdSchema,
  topicId: topicIdSchema.optional(),
  title: titleSchema,
  description: optionalDescriptionSchema,
  assignedOn: isoDateSchema.optional(),
  dueAt: isoDateTimeSchema.optional(),
  submittedAt: isoDateTimeSchema.optional(),
  maximumScore: nonNegativeDecimalStringSchema.optional(),
  weightPercentage: percentageStringSchema.optional(),
  priority: assignmentPrioritySchema,
  status: assignmentStatusSchema,
  externalUrl: optionalUrlSchema,
};

export const assignmentSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: assignmentIdSchema,
  ...assignmentFields,
});
export type Assignment = z.infer<typeof assignmentSchema>;

export const createAssignmentInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...assignmentFields,
});
export type CreateAssignmentInput = z.infer<typeof createAssignmentInputSchema>;

export const updateAssignmentInputSchema = z.strictObject({
  id: assignmentIdSchema,
  courseId: assignmentFields.courseId.optional(),
  topicId: assignmentFields.topicId,
  title: assignmentFields.title.optional(),
  description: assignmentFields.description,
  assignedOn: assignmentFields.assignedOn,
  dueAt: assignmentFields.dueAt,
  submittedAt: assignmentFields.submittedAt,
  maximumScore: assignmentFields.maximumScore,
  weightPercentage: assignmentFields.weightPercentage,
  priority: assignmentFields.priority.optional(),
  status: assignmentFields.status.optional(),
  externalUrl: assignmentFields.externalUrl,
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.");
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentInputSchema>;

export const assignmentQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  courseId: courseIdSchema.optional(),
  status: assignmentStatusSchema.optional(),
  priority: assignmentPrioritySchema.optional(),
  dueFrom: isoDateTimeSchema.optional(),
  dueTo: isoDateTimeSchema.optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type AssignmentQuery = z.infer<typeof assignmentQuerySchema>;
export type AssignmentListQuery = AssignmentQuery;

export const submitAssignmentInputSchema = z.strictObject({
  id: assignmentIdSchema,
  ownerId: ownerIdSchema,
  submittedAt: isoDateTimeSchema,
});
export type SubmitAssignmentInput = z.infer<typeof submitAssignmentInputSchema>;

export const upcomingAssignmentsQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  courseId: courseIdSchema.optional(),
  dueBefore: isoDateTimeSchema.optional(),
  limit: z.number().int().min(1).max(100).optional(),
});
export type UpcomingAssignmentsQuery = z.infer<typeof upcomingAssignmentsQuerySchema>;
