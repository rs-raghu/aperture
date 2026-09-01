import type { IsoDateString, OwnerId, OwnerQuery, PageResult } from "../education.types.js";
import type { InstitutionId } from "../institutions/institution.types.js";
import type { AcademicProgram, ProgramId, ProgramStatus } from "./program.types.js";

export interface CreateProgramInput {
  readonly ownerId: OwnerId;
  readonly institutionId: InstitutionId;
  readonly name: string;
  readonly startsOn?: IsoDateString;
  readonly endsOn?: IsoDateString;
}

export interface UpdateProgramInput {
  readonly institutionId?: InstitutionId;
  readonly name?: string;
  readonly status?: ProgramStatus;
  readonly startsOn?: IsoDateString;
  readonly endsOn?: IsoDateString;
}

export interface ProgramListQuery extends OwnerQuery {
  readonly institutionId?: InstitutionId;
  readonly status?: ProgramStatus;
}

export declare function createProgram(input: CreateProgramInput): Promise<AcademicProgram>;
export declare function updateProgram(id: ProgramId, ownerId: OwnerId, input: UpdateProgramInput): Promise<AcademicProgram>;
export declare function archiveProgram(id: ProgramId, ownerId: OwnerId): Promise<AcademicProgram>;
export declare function getProgram(id: ProgramId, ownerId: OwnerId): Promise<AcademicProgram | null>;
export declare function listPrograms(query: ProgramListQuery): Promise<PageResult<AcademicProgram>>;
