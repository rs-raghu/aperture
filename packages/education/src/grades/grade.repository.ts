import type { CrudRepository } from "../repositories/repository.types.js";
import type { GradesByCourseQuery, RecordGradeInput, UpdateGradeInput } from "./grade.contracts.js";
import type { Grade, GradeId } from "./grade.types.js";

export interface GradeRepository
  extends CrudRepository<Grade, GradeId, RecordGradeInput, UpdateGradeInput, GradesByCourseQuery> {}
