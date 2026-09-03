import { z } from "@aperture/validation";
import { entityMetadataSchema, hasAtLeastOneDefinedValue, identifierSchema, isoDateSchema, optionalNotesSchema, optionalUrlSchema, ownerIdSchema, paginationInputSchema, shortTextSchema, sortDirectionSchema, titleSchema } from "../education.types.js";
import { courseIdSchema } from "../courses/course.types.js";
import { institutionIdSchema } from "../institutions/institution.types.js";
import { programIdSchema } from "../programs/program.types.js";

export const certificateIdSchema = identifierSchema;
export type CertificateId = z.infer<typeof certificateIdSchema>;
export const certificateStatuses = ["planned", "earned", "expired", "revoked"] as const;
export const certificateStatusSchema = z.enum(certificateStatuses);
export type CertificateStatus = z.infer<typeof certificateStatusSchema>;

const certificateFields = {
  institutionId: institutionIdSchema.optional(),
  programId: programIdSchema.optional(),
  courseId: courseIdSchema.optional(),
  name: titleSchema,
  issuingOrganization: shortTextSchema,
  issuedOn: isoDateSchema.optional(),
  expiresOn: isoDateSchema.optional(),
  credentialId: z.string().trim().min(1).max(200).optional(),
  credentialUrl: optionalUrlSchema,
  status: certificateStatusSchema,
  notes: optionalNotesSchema,
};
const datesAreOrdered = (value: { issuedOn?: string | undefined; expiresOn?: string | undefined }): boolean =>
  value.issuedOn === undefined || value.expiresOn === undefined || value.expiresOn >= value.issuedOn;

export const certificateSchema = z.strictObject({
  ...entityMetadataSchema.shape,
  id: certificateIdSchema,
  ...certificateFields,
}).refine(datesAreOrdered, { message: "Expiry date cannot be earlier than issue date.", path: ["expiresOn"] });
export type Certificate = z.infer<typeof certificateSchema>;

export const createCertificateInputSchema = z.strictObject({
  ownerId: ownerIdSchema,
  ...certificateFields,
}).refine(datesAreOrdered, { message: "Expiry date cannot be earlier than issue date.", path: ["expiresOn"] });
export type CreateCertificateInput = z.infer<typeof createCertificateInputSchema>;

export const updateCertificateInputSchema = z.strictObject({
  id: certificateIdSchema,
  institutionId: certificateFields.institutionId,
  programId: certificateFields.programId,
  courseId: certificateFields.courseId,
  name: certificateFields.name.optional(),
  issuingOrganization: certificateFields.issuingOrganization.optional(),
  issuedOn: certificateFields.issuedOn,
  expiresOn: certificateFields.expiresOn,
  credentialId: certificateFields.credentialId,
  credentialUrl: certificateFields.credentialUrl,
  status: certificateFields.status.optional(),
  notes: certificateFields.notes,
}).refine(hasAtLeastOneDefinedValue, "At least one mutable field is required.")
  .refine(datesAreOrdered, { message: "Expiry date cannot be earlier than issue date when both are supplied.", path: ["expiresOn"] });
export type UpdateCertificateInput = z.infer<typeof updateCertificateInputSchema>;

export const certificateQuerySchema = z.strictObject({
  ownerId: ownerIdSchema,
  institutionId: institutionIdSchema.optional(),
  programId: programIdSchema.optional(),
  courseId: courseIdSchema.optional(),
  status: certificateStatusSchema.optional(),
  issuingOrganization: z.string().trim().min(1).max(200).optional(),
  sortDirection: sortDirectionSchema.optional(),
  ...paginationInputSchema.shape,
});
export type CertificateQuery = z.infer<typeof certificateQuerySchema>;
export type CertificateListQuery = CertificateQuery;
