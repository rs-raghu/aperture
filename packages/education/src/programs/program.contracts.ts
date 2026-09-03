import type { OwnerId, PageResult } from "../education.types.js";
import type { AcademicProgram, CreateProgramInput, ProgramId, ProgramListQuery, UpdateProgramInput } from "./program.types.js";
export type { CreateProgramInput, ProgramListQuery, UpdateProgramInput } from "./program.types.js";
export declare function createProgram(input: CreateProgramInput): Promise<AcademicProgram>;
export declare function updateProgram(id: ProgramId, ownerId: OwnerId, input: UpdateProgramInput): Promise<AcademicProgram>;
export declare function archiveProgram(id: ProgramId, ownerId: OwnerId): Promise<AcademicProgram>;
export declare function getProgram(id: ProgramId, ownerId: OwnerId): Promise<AcademicProgram | null>;
export declare function listPrograms(query: ProgramListQuery): Promise<PageResult<AcademicProgram>>;
