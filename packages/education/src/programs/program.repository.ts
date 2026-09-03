import type { CrudRepository } from "../repositories/repository.types.js";
import type { AcademicProgram, ProgramId, ProgramListQuery } from "./program.types.js";

export interface ProgramRepository
  extends CrudRepository<AcademicProgram, ProgramId, ProgramListQuery> {}
