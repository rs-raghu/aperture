import type { PlannerCrudRepository, PlannerRepository } from "./planner.repository.js";
import type {
  PlannerItem, PlannerItemLink, PlannerItemLinkQuery, PlannerItemQuery, PlannerPageRequest,
  PlannerPlan, PlannerPlanQuery,
} from "./planner.types.js";

interface Entity { readonly id: string; readonly ownerId: string; readonly createdAt: string; readonly updatedAt: string; }
type Matcher<TEntity, TQuery> = (entity: TEntity, query: TQuery) => boolean;
type Comparator<TEntity> = (left: TEntity, right: TEntity) => number;

function clone<T>(value: T): T { return structuredClone(value); }
function text(left?: string, right?: string): number {
  if (left === undefined) return right === undefined ? 0 : 1;
  if (right === undefined) return -1;
  return left.localeCompare(right);
}

function createCollection<TEntity extends Entity, TQuery extends PlannerPageRequest>(
  matches: Matcher<TEntity, TQuery>, compare: Comparator<TEntity>,
): PlannerCrudRepository<TEntity, TQuery> {
  const records = new Map<string, TEntity>();
  const repository: PlannerCrudRepository<TEntity, TQuery> = {
    async create(entity) {
      if (records.has(entity.id)) throw new Error(`Planner record ${entity.id} already exists.`);
      records.set(entity.id, clone(entity)); return clone(entity);
    },
    async update(entity) {
      const current = records.get(entity.id);
      if (current === undefined || current.ownerId !== entity.ownerId) throw new Error(`Planner record ${entity.id} was not found.`);
      if (current.createdAt !== entity.createdAt) throw new Error("Planner record identity is immutable.");
      records.set(entity.id, clone(entity)); return clone(entity);
    },
    async delete(id, ownerId) {
      const current = records.get(id);
      if (current === undefined || current.ownerId !== ownerId) throw new Error(`Planner record ${id} was not found.`);
      records.delete(id);
    },
    async findById(id, ownerId) {
      const current = records.get(id);
      return current === undefined || current.ownerId !== ownerId ? null : clone(current);
    },
    async findMany(query) {
      const offset = query.cursor === undefined ? 0 : Number(/^memory:(\d+)$/.exec(query.cursor)?.[1]);
      if (!Number.isSafeInteger(offset) || offset < 0) throw new Error("Planner pagination cursor is invalid.");
      if (query.limit !== undefined && (!Number.isInteger(query.limit) || query.limit < 1 || query.limit > 100)) throw new Error("Planner pagination limit must be from 1 through 100.");
      const direction = query.sortDirection === "descending" ? -1 : 1;
      const filtered = [...records.values()].filter((item) => item.ownerId === query.ownerId && matches(item, query))
        .sort((left, right) => (compare(left, right) || left.id.localeCompare(right.id)) * direction);
      const end = query.limit === undefined ? filtered.length : Math.min(filtered.length, offset + query.limit);
      return end < filtered.length
        ? { items: filtered.slice(offset, end).map(clone), nextCursor: `memory:${end}` }
        : { items: filtered.slice(offset, end).map(clone) };
    },
  };
  return Object.freeze(repository);
}

export function createPlannerMemoryRepository(): PlannerRepository {
  return Object.freeze({
    plans: createCollection<PlannerPlan, PlannerPlanQuery>(
      (plan, query) => (query.status === undefined || plan.status === query.status)
        && (query.planType === undefined || plan.planType === query.planType)
        && (query.intersectsFrom === undefined || plan.endsOn === undefined || plan.endsOn >= query.intersectsFrom)
        && (query.intersectsTo === undefined || plan.startsOn === undefined || plan.startsOn <= query.intersectsTo),
      (left, right) => text(left.startsOn, right.startsOn),
    ),
    items: createCollection<PlannerItem, PlannerItemQuery>(
      (item, query) => (query.planId === undefined || item.planId === query.planId)
        && (query.itemType === undefined || item.itemType === query.itemType)
        && (query.status === undefined || item.status === query.status)
        && (query.priority === undefined || item.priority === query.priority)
        && (query.scheduledFrom === undefined || (item.scheduledFor !== undefined && item.scheduledFor >= query.scheduledFrom))
        && (query.scheduledTo === undefined || (item.scheduledFor !== undefined && item.scheduledFor <= query.scheduledTo))
        && (query.dueBefore === undefined || (item.dueAt !== undefined && item.dueAt <= query.dueBefore)),
      (left, right) => text(left.scheduledFor ?? left.startsAt ?? left.dueAt, right.scheduledFor ?? right.startsAt ?? right.dueAt) || right.priority - left.priority,
    ),
    itemLinks: createCollection<PlannerItemLink, PlannerItemLinkQuery>(
      (link, query) => (query.plannerItemId === undefined || link.plannerItemId === query.plannerItemId)
        && (query.targetScope === undefined || link.targetScope === query.targetScope)
        && (query.targetId === undefined || link.targetId === query.targetId),
      (left, right) => left.targetScope.localeCompare(right.targetScope) || left.targetId.localeCompare(right.targetId),
    ),
  });
}
