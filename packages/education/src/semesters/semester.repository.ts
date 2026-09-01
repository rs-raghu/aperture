import type { CrudRepository } from "../repositories/repository.types.js";
import type { CreateSemesterInput, SemesterListQuery, UpdateSemesterInput } from "./semester.contracts.js";
import type { Semester, SemesterId } from "./semester.types.js";

export interface SemesterRepository
  extends CrudRepository<Semester, SemesterId, CreateSemesterInput, UpdateSemesterInput, SemesterListQuery> {
  activate(id: SemesterId, ownerId: string): Promise<Semester>;
  complete(id: SemesterId, ownerId: string): Promise<Semester>;
}
