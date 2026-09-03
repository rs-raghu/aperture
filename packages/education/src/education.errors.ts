import { z } from "@aperture/validation";

export const educationErrorCodes = [
  "invalid_input",
  "unsupported_status",
  "invalid_date_range",
  "invalid_decimal_representation",
  "missing_required_relationship",
  "conflicting_relationship_fields",
  "unknown_validation_failure",
] as const;

export const educationErrorCodeSchema = z.enum(educationErrorCodes);
export type EducationErrorCode = z.infer<typeof educationErrorCodeSchema>;

export const educationValidationIssueSchema = z.strictObject({
  code: z.string().min(1),
  message: z.string().min(1),
  path: z.array(z.union([z.string(), z.number()])),
});
export type EducationValidationIssue = z.infer<typeof educationValidationIssueSchema>;

export const educationDomainErrorSchema = z.strictObject({
  code: educationErrorCodeSchema,
  message: z.string().min(1),
  issues: z.array(educationValidationIssueSchema).optional(),
});
export type EducationDomainError = z.infer<typeof educationDomainErrorSchema>;
