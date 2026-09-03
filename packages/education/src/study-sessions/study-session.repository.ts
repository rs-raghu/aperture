import type { CrudRepository } from "../repositories/repository.types.js";
import type { StudySession, StudySessionId, StudySessionListQuery } from "./study-session.types.js";

export interface StudySessionRepository
  extends CrudRepository<StudySession, StudySessionId, StudySessionListQuery> {}
