import { z } from "@aperture/validation";
import { creditValueSchema, entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateSchema, optionalDescriptionSchema, ownerIdSchema, paginationInputSchema, shortTextSchema, sortDirectionSchema, titleSchema } from "../education.types.js";
import { institutionIdSchema } from "../institutions/institution.types.js";

export const programIdSchema = identifierSchema;
export type ProgramId = z.infer<typeof programIdSchema>;
export const programTypes = ["degree", "diploma", "certificate", "course_of_study", "other"] as const;
export const programTypeSchema = z.enum(programTypes);
export type ProgramType = z.infer<typeof programTypeSchema>;
export const programStatuses = ["planned", "active", "completed", "archived"] as const;
export const programStatusSchema = z.enum(programStatuses);
export type ProgramStatus = z.infer<typeof programStatusSchema>;

const programFields = {
  institutionId: institutionIdSchema,
  name: titleSchema,
  programType: programTypeSchema,
  awardName: shortTextSchema.optional(),
  fieldOfStudy: shortTextSchema.optional(),
  startsOn: isoDateSchema,
  expectedCompletionOn: isoDateSchema.optional(),
  requiredCredits: creditValueSchema.optional(),
  status: programStatusSchema,
  description: optionalDescriptionSchema,
};
const datesAreOrdered = (value: { startsOn?: string | undefined; expectedCompletionOn?: string | undefined }): boolean =>
  value.expectedCompletionOn === undefined || value.startsOn === undefined || value.expectedCompletionOn >= value.startsOn;

export const academicProgramSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: programIdSchema,
  ...programFields,
}).refine(datesAreOrdered, { message: "Expected completion cannot be earlier than the start date.", path: ["expectedCompletionOn"] });
export type AcademicProgram = z.infer<typeof academicProgramSchema>;

export const createProgramInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...programFields,
}).refine(datesAreOrdered, { message: "Expected completion cannot be earlier than the start date.", path: ["expectedCompletionOn"] });
export type CreateProgramInput = z.infer<typeof createProgramInputSchema>;

export const updateProgramInputSchema = z.strictObject({
  id: programIdSchema,
  institutionId: programFields.institutionId.optional(),
  name: programFields.name.optional(),
  programType: programFields.programType.optional(),
  awardName: programFields.awardName,
  fieldOfStudy: programFields.fieldOfStudy,
  startsOn: programFields.startsOn.optional(),
  expectedCompletionOn: programFields.expectedCompletionOn,
  requiredCredits: programFields.requiredCredits,
  status: programFields.status.optional(),
  description: programFields.description,
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.")
  .refine(datesAreOrdered, { message: "Expected completion cannot be earlier than the start date when both are supplied.", path: ["expectedCompletionOn"] });
export type UpdateProgramInput = z.infer<typeof updateProgramInputSchema>;

export const programQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  institutionId: institutionIdSchema.optional(),
  programType: programTypeSchema.optional(),
  status: programStatusSchema.optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type ProgramQuery = z.infer<typeof programQuerySchema>;
export type ProgramListQuery = ProgramQuery;
