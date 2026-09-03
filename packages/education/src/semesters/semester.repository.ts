import type { CrudRepository } from "../repositories/repository.types.js";
import type { Semester, SemesterId, SemesterListQuery } from "./semester.types.js";

export interface SemesterRepository
  extends CrudRepository<Semester, SemesterId, SemesterListQuery> {}
