import { z } from "@aperture/validation";
import { entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, optionalNotesSchema, optionalUrlSchema, ownerIdSchema, paginationInputSchema, shortTextSchema, sortDirectionSchema, titleSchema } from "../education.types.js";
import { courseIdSchema } from "../courses/course.types.js";
import { topicIdSchema } from "../topics/topic.types.js";

export const resourceIdSchema = identifierSchema;
export type ResourceId = z.infer<typeof resourceIdSchema>;
export const resourceTypes = ["book", "article", "video", "document", "link", "courseware", "other"] as const;
export const resourceTypeSchema = z.enum(resourceTypes);
export type ResourceType = z.infer<typeof resourceTypeSchema>;
export type ResourceKind = ResourceType;
export const resourceKindSchema = resourceTypeSchema;
export const resourceStatuses = ["active", "completed", "archived"] as const;
export const resourceStatusSchema = z.enum(resourceStatuses);
export type ResourceStatus = z.infer<typeof resourceStatusSchema>;

const resourceFields = {
  courseId: courseIdSchema,
  topicId: topicIdSchema.optional(),
  title: titleSchema,
  type: resourceTypeSchema,
  url: optionalUrlSchema,
  localReference: z.string().trim().min(1).max(1000).optional(),
  author: shortTextSchema.optional(),
  status: resourceStatusSchema,
  notes: optionalNotesSchema,
};

export const learningResourceSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: resourceIdSchema,
  ...resourceFields,
});
export type LearningResource = z.infer<typeof learningResourceSchema>;

export const createLearningResourceInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...resourceFields,
});
export type CreateLearningResourceInput = z.infer<typeof createLearningResourceInputSchema>;
export type CreateResourceInput = CreateLearningResourceInput;
export const createResourceInputSchema = createLearningResourceInputSchema;

export const updateLearningResourceInputSchema = z.strictObject({
  id: resourceIdSchema,
  courseId: resourceFields.courseId.optional(),
  topicId: resourceFields.topicId,
  title: resourceFields.title.optional(),
  type: resourceFields.type.optional(),
  url: resourceFields.url,
  localReference: resourceFields.localReference,
  author: resourceFields.author,
  status: resourceFields.status.optional(),
  notes: resourceFields.notes,
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.");
export type UpdateLearningResourceInput = z.infer<typeof updateLearningResourceInputSchema>;
export type UpdateResourceInput = UpdateLearningResourceInput;
export const updateResourceInputSchema = updateLearningResourceInputSchema;

export const learningResourceQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  courseId: courseIdSchema,
  topicId: topicIdSchema.optional(),
  type: resourceTypeSchema.optional(),
  status: resourceStatusSchema.optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type LearningResourceQuery = z.infer<typeof learningResourceQuerySchema>;
export type ResourcesByCourseQuery = LearningResourceQuery;
export const resourcesByCourseQuerySchema = learningResourceQuerySchema;
