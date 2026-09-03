import { z } from "@aperture/validation";
import { entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateSchema, optionalDescriptionSchema, optionalNotesSchema, optionalUrlSchema, ownerIdSchema, paginationInputSchema, shortTextSchema, sortDirectionSchema, titleSchema } from "../education.types.js";

export const institutionIdSchema = identifierSchema;
export type InstitutionId = z.infer<typeof institutionIdSchema>;
export const institutionTypes = ["university", "college", "school", "training_provider", "other"] as const;
export const institutionTypeSchema = z.enum(institutionTypes);
export type InstitutionType = z.infer<typeof institutionTypeSchema>;
export const institutionStatuses = ["planned", "active", "completed", "archived"] as const;
export const institutionStatusSchema = z.enum(institutionStatuses);
export type InstitutionStatus = z.infer<typeof institutionStatusSchema>;

const institutionFields = {
  name: titleSchema,
  shortName: shortTextSchema.max(80).optional(),
  type: institutionTypeSchema,
  websiteUrl: optionalUrlSchema,
  location: z.string().trim().min(1).max(500).optional(),
  startsOn: isoDateSchema.optional(),
  endsOn: isoDateSchema.optional(),
  status: institutionStatusSchema,
  description: optionalDescriptionSchema,
  notes: optionalNotesSchema,
};
const datesAreOrdered = (value: { startsOn?: string | undefined; endsOn?: string | undefined }): boolean =>
  value.startsOn === undefined || value.endsOn === undefined || value.endsOn >= value.startsOn;

export const institutionSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: institutionIdSchema,
  ...institutionFields,
}).refine(datesAreOrdered, { message: "End date cannot be earlier than start date.", path: ["endsOn"] });
export type Institution = z.infer<typeof institutionSchema>;

export const createInstitutionInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...institutionFields,
}).refine(datesAreOrdered, { message: "End date cannot be earlier than start date.", path: ["endsOn"] });
export type CreateInstitutionInput = z.infer<typeof createInstitutionInputSchema>;

export const updateInstitutionInputSchema = z.strictObject({
  id: institutionIdSchema,
  name: institutionFields.name.optional(),
  shortName: institutionFields.shortName,
  type: institutionFields.type.optional(),
  websiteUrl: institutionFields.websiteUrl,
  location: institutionFields.location,
  startsOn: institutionFields.startsOn,
  endsOn: institutionFields.endsOn,
  status: institutionFields.status.optional(),
  description: institutionFields.description,
  notes: institutionFields.notes,
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.")
  .refine(datesAreOrdered, { message: "End date cannot be earlier than start date when both are supplied.", path: ["endsOn"] });
export type UpdateInstitutionInput = z.infer<typeof updateInstitutionInputSchema>;

export const institutionQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  type: institutionTypeSchema.optional(),
  status: institutionStatusSchema.optional(),
  search: z.string().trim().min(1).max(200).optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type InstitutionQuery = z.infer<typeof institutionQuerySchema>;
export type InstitutionListQuery = InstitutionQuery;
