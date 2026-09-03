import { z } from "@aperture/validation";
import { entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateSchema, ownerIdSchema, paginationInputSchema, sortDirectionSchema, titleSchema } from "../education.types.js";
import { programIdSchema } from "../programs/program.types.js";

export const semesterIdSchema = identifierSchema;
export type SemesterId = z.infer<typeof semesterIdSchema>;
export const semesterStatuses = ["planned", "active", "completed"] as const;
export const semesterStatusSchema = z.enum(semesterStatuses);
export type SemesterStatus = z.infer<typeof semesterStatusSchema>;

const semesterFields = {
  programId: programIdSchema,
  name: titleSchema,
  academicYear: z.string().trim().min(1).max(40),
  sequence: z.number().int().min(1),
  startsOn: isoDateSchema,
  endsOn: isoDateSchema,
  status: semesterStatusSchema,
};
const datesAreOrdered = (value: { startsOn?: string | undefined; endsOn?: string | undefined }): boolean =>
  value.startsOn === undefined || value.endsOn === undefined || value.endsOn >= value.startsOn;

export const semesterSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: semesterIdSchema,
  ...semesterFields,
}).refine(datesAreOrdered, { message: "End date cannot be earlier than start date.", path: ["endsOn"] });
export type Semester = z.infer<typeof semesterSchema>;

export const createSemesterInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...semesterFields,
}).refine(datesAreOrdered, { message: "End date cannot be earlier than start date.", path: ["endsOn"] });
export type CreateSemesterInput = z.infer<typeof createSemesterInputSchema>;

export const updateSemesterInputSchema = z.strictObject({
  id: semesterIdSchema,
  programId: semesterFields.programId.optional(),
  name: semesterFields.name.optional(),
  academicYear: semesterFields.academicYear.optional(),
  sequence: semesterFields.sequence.optional(),
  startsOn: semesterFields.startsOn.optional(),
  endsOn: semesterFields.endsOn.optional(),
  status: semesterFields.status.optional(),
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.")
  .refine(datesAreOrdered, { message: "End date cannot be earlier than start date when both are supplied.", path: ["endsOn"] });
export type UpdateSemesterInput = z.infer<typeof updateSemesterInputSchema>;

export const semesterQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  programId: programIdSchema.optional(),
  status: semesterStatusSchema.optional(),
  academicYear: z.string().trim().min(1).max(40).optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type SemesterQuery = z.infer<typeof semesterQuerySchema>;
export type SemesterListQuery = SemesterQuery;
