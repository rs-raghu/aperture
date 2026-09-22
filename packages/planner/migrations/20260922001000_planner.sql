begin;

alter table platform.synchronization_status
  drop constraint synchronization_status_scope_check,
  add constraint synchronization_status_scope_check check (scope in ('education', 'health', 'finance', 'planner', 'platform'));

alter table platform.synchronization_events
  drop constraint synchronization_events_scope_check,
  add constraint synchronization_events_scope_check check (scope in ('education', 'health', 'finance', 'planner', 'platform'));

alter table planner.plans
  add column plan_type text not null default 'custom' check (plan_type in ('day', 'week', 'custom'));

alter table planner.items
  add column description text,
  add column due_at timestamptz,
  add column recurrence_rule jsonb,
  add column completed_at timestamptz,
  add constraint planner_items_completion_match check ((status = 'completed') = (completed_at is not null));

create index planner_items_owner_due_idx
  on planner.items (owner_id, due_at, priority desc, id)
  where deleted_at is null and status not in ('completed', 'cancelled', 'archived');

insert into platform.migration_audit (version, scope, name)
values ('20260922001000', 'planner', 'today-and-planner');

commit;
