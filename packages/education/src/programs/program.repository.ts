import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateProgramInput, ProgramListQuery, UpdateProgramInput } from "./program.contracts.js";
import type { AcademicProgram, ProgramId } from "./program.types.js";

export interface ProgramRepository
  extends CrudRepository<AcademicProgram, ProgramId, CreateProgramInput, UpdateProgramInput, ProgramListQuery> {
  archive(id: ProgramId, ownerId: string): Promise<AcademicProgram>;
}
