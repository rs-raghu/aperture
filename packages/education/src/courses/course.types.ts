import { z } from "@aperture/validation";
import { creditValueSchema, entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateSchema, optionalDescriptionSchema, ownerIdSchema, paginationInputSchema, shortTextSchema, sortDirectionSchema, titleSchema } from "../education.types.js";
import { semesterIdSchema } from "../semesters/semester.types.js";

export const courseIdSchema = identifierSchema;
export type CourseId = z.infer<typeof courseIdSchema>;
export const courseStatuses = ["planned", "active", "completed", "archived"] as const;
export const courseStatusSchema = z.enum(courseStatuses);
export type CourseStatus = z.infer<typeof courseStatusSchema>;
export const courseDeliveryModes = ["in_person", "online", "hybrid", "self_paced", "other"] as const;
export const courseDeliveryModeSchema = z.enum(courseDeliveryModes);
export type CourseDeliveryMode = z.infer<typeof courseDeliveryModeSchema>;

const courseFields = {
  semesterId: semesterIdSchema,
  code: z.string().trim().min(1).max(40).optional(),
  name: titleSchema,
  description: optionalDescriptionSchema,
  credits: creditValueSchema.optional(),
  instructor: shortTextSchema.optional(),
  deliveryMode: courseDeliveryModeSchema,
  displayToken: z.string().trim().min(1).max(80).optional(),
  startsOn: isoDateSchema.optional(),
  endsOn: isoDateSchema.optional(),
  status: courseStatusSchema,
};
const datesAreOrdered = (value: { startsOn?: string | undefined; endsOn?: string | undefined }): boolean =>
  value.startsOn === undefined || value.endsOn === undefined || value.endsOn >= value.startsOn;

export const courseSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: courseIdSchema,
  ...courseFields,
}).refine(datesAreOrdered, { message: "End date cannot be earlier than start date.", path: ["endsOn"] });
export type Course = z.infer<typeof courseSchema>;

export const createCourseInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...courseFields,
}).refine(datesAreOrdered, { message: "End date cannot be earlier than start date.", path: ["endsOn"] });
export type CreateCourseInput = z.infer<typeof createCourseInputSchema>;

export const updateCourseInputSchema = z.strictObject({
  id: courseIdSchema,
  semesterId: courseFields.semesterId.optional(),
  code: courseFields.code,
  name: courseFields.name.optional(),
  description: courseFields.description,
  credits: courseFields.credits,
  instructor: courseFields.instructor,
  deliveryMode: courseFields.deliveryMode.optional(),
  displayToken: courseFields.displayToken,
  startsOn: courseFields.startsOn,
  endsOn: courseFields.endsOn,
  status: courseFields.status.optional(),
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.")
  .refine(datesAreOrdered, { message: "End date cannot be earlier than start date when both are supplied.", path: ["endsOn"] });
export type UpdateCourseInput = z.infer<typeof updateCourseInputSchema>;

export const courseQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  semesterId: semesterIdSchema.optional(),
  status: courseStatusSchema.optional(),
  deliveryMode: courseDeliveryModeSchema.optional(),
  search: z.string().trim().min(1).max(200).optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type CourseQuery = z.infer<typeof courseQuerySchema>;
export type CourseListQuery = CourseQuery;

export const coursesBySemesterQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  semesterId: semesterIdSchema,
  status: courseStatusSchema.optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type CoursesBySemesterQuery = z.infer<typeof coursesBySemesterQuerySchema>;
