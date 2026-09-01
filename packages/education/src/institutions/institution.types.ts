import type { EntityMetadata } from "../education.types.js";

export type InstitutionId = string;
export type InstitutionStatus = "active" | "archived";

export interface Institution extends EntityMetadata {
  readonly id: InstitutionId;
  readonly name: string;
  readonly status: InstitutionStatus;
}
