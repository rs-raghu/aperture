import { z } from "@aperture/validation";
import { entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateTimeSchema, optionalDescriptionSchema, ownerIdSchema, paginationInputSchema, sortDirectionSchema, titleSchema } from "../education.types.js";
import { courseIdSchema } from "../courses/course.types.js";

export const topicIdSchema = identifierSchema;
export type TopicId = z.infer<typeof topicIdSchema>;
export const topicStatuses = ["planned", "in_progress", "completed"] as const;
export const topicStatusSchema = z.enum(topicStatuses);
export type TopicStatus = z.infer<typeof topicStatusSchema>;

const topicFields = {
  courseId: courseIdSchema,
  parentTopicId: topicIdSchema.optional(),
  title: titleSchema,
  description: optionalDescriptionSchema,
  sequence: z.number().int().min(1),
  estimatedStudyMinutes: z.number().int().min(0).optional(),
  status: topicStatusSchema,
  completedAt: isoDateTimeSchema.optional(),
};

export const courseTopicSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: topicIdSchema,
  ...topicFields,
}).refine(({ id, parentTopicId }) => parentTopicId === undefined || parentTopicId !== id, {
  message: "A topic cannot be its own parent.",
  path: ["parentTopicId"],
});
export type CourseTopic = z.infer<typeof courseTopicSchema>;

export const createTopicInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...topicFields,
});
export type CreateTopicInput = z.infer<typeof createTopicInputSchema>;

export const updateTopicInputSchema = z.strictObject({
  id: topicIdSchema,
  courseId: topicFields.courseId.optional(),
  parentTopicId: topicFields.parentTopicId,
  title: topicFields.title.optional(),
  description: topicFields.description,
  sequence: topicFields.sequence.optional(),
  estimatedStudyMinutes: topicFields.estimatedStudyMinutes,
  status: topicFields.status.optional(),
  completedAt: topicFields.completedAt,
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.");
export type UpdateTopicInput = z.infer<typeof updateTopicInputSchema>;

export const topicQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  courseId: courseIdSchema,
  parentTopicId: topicIdSchema.optional(),
  status: topicStatusSchema.optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type TopicQuery = z.infer<typeof topicQuerySchema>;
export type TopicsByCourseQuery = TopicQuery;
