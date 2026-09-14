import { z } from "@aperture/validation";
import { textSchema } from "./internal/primitives.js";

export const healthErrorCodeSchema = z.enum(["not_found", "conflict", "invalid_state", "unsupported_operation"]);
export type HealthErrorCode = Readonly<z.infer<typeof healthErrorCodeSchema>>;

export const healthDomainErrorSchema = z.strictObject({ code: healthErrorCodeSchema, message: textSchema, details: z.record(z.unknown()).readonly().optional() }).readonly();
export type HealthDomainError = Readonly<z.infer<typeof healthDomainErrorSchema>>;
