begin;

do $$
begin
  create role anon nologin;
exception when duplicate_object then null;
end
$$;

do $$
begin
  create role authenticated nologin;
exception when duplicate_object then null;
end
$$;

revoke all on schema education, health, finance, platform, planner from public, anon;
grant usage on schema education, health, finance, platform, planner to authenticated;
grant execute on function app_private.current_owner_id() to authenticated;
revoke execute on function app_private.current_owner_id() from public, anon;

revoke all on all tables in schema education, health, finance, platform, planner from public, anon;
grant select, insert, update, delete on all tables in schema education, health, finance, platform, planner to authenticated;
revoke all on platform.migration_audit from authenticated;

alter default privileges in schema education revoke all on tables from public, anon;
alter default privileges in schema health revoke all on tables from public, anon;
alter default privileges in schema finance revoke all on tables from public, anon;
alter default privileges in schema platform revoke all on tables from public, anon;
alter default privileges in schema planner revoke all on tables from public, anon;
alter default privileges in schema education grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema health grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema finance grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema platform grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema planner grant select, insert, update, delete on tables to authenticated;

insert into platform.migration_audit (version, scope, name)
values ('20260921006000', 'core', 'personal-auth-security');

commit;
