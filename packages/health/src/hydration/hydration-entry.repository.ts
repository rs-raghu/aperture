import type { CrudRepository } from "../repositories/repository.types.js";
import type { HydrationEntryListQuery, RecordHydrationInput, UpdateHydrationEntryInput } from "./hydration-entry.contracts.js";
import type { HydrationEntry, HydrationEntryId } from "./hydration-entry.types.js";

export interface HydrationEntryRepository
  extends CrudRepository<HydrationEntry, HydrationEntryId, RecordHydrationInput, UpdateHydrationEntryInput, HydrationEntryListQuery> {}
