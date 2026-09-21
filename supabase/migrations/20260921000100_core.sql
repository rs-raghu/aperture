begin;

create schema if not exists app_private;
create schema if not exists platform;
create schema if not exists education;
create schema if not exists health;
create schema if not exists finance;
create schema if not exists planner;

revoke all on schema app_private from public;

create or replace function app_private.current_owner_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;

create or replace function app_private.touch_owned_record()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := statement_timestamp();
  new.record_version := old.record_version + 1;
  return new;
end
$$;

create or replace function app_private.create_owned_record_table(target_schema text, target_table text)
returns void
language plpgsql
set search_path = pg_catalog
as $$
declare
  qualified_name text := format('%I.%I', target_schema, target_table);
  owner_policy text := format('%s_owner_access', target_table);
begin
  execute format(
    'create table %s (
      id uuid primary key,
      owner_id uuid not null,
      payload jsonb not null default ''{}''::jsonb,
      created_at timestamptz not null default statement_timestamp(),
      updated_at timestamptz not null default statement_timestamp(),
      deleted_at timestamptz,
      record_version bigint not null default 1,
      constraint %I check (jsonb_typeof(payload) = ''object''),
      constraint %I check (record_version > 0),
      constraint %I unique (owner_id, id)
    )',
    qualified_name,
    target_table || '_payload_object',
    target_table || '_record_version_positive',
    target_table || '_owner_id_unique'
  );
  execute format('create index %I on %s (owner_id, updated_at desc, id)', target_table || '_owner_updated_idx', qualified_name);
  execute format('create index %I on %s (owner_id, deleted_at) where deleted_at is null', target_table || '_owner_active_idx', qualified_name);
  execute format('alter table %s enable row level security', qualified_name);
  execute format(
    'create policy %I on %s for all using (owner_id = app_private.current_owner_id()) with check (owner_id = app_private.current_owner_id())',
    owner_policy,
    qualified_name
  );
  execute format(
    'create trigger %I before update on %s for each row execute function app_private.touch_owned_record()',
    target_table || '_touch',
    qualified_name
  );
end
$$;

create table platform.migration_audit (
  version text primary key check (version ~ '^[0-9]{14}$'),
  scope text not null check (scope ~ '^[a-z0-9_-]+$'),
  name text not null,
  applied_at timestamptz not null default statement_timestamp()
);

insert into platform.migration_audit (version, scope, name)
values ('20260921000100', 'core', 'core');

commit;
