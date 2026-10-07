begin;
create schema portfolio;
select app_private.create_owned_record_table('portfolio', 'drafts');
alter table portfolio.drafts add constraint portfolio_owner_unique unique (owner_id);
grant usage on schema portfolio to authenticated;
grant select, insert, update, delete on portfolio.drafts to authenticated;
revoke all on schema portfolio from anon;
revoke all on portfolio.drafts from anon;

-- Invoker security and the normal owner RLS apply to both the insert and compare-and-save paths.
create function portfolio.save_draft(candidate jsonb, expected_revision integer) returns boolean
language plpgsql security invoker set search_path = pg_catalog, portfolio
as $$
declare affected integer; current_owner uuid := nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
begin
  if current_owner is null or candidate->>'ownerId' is distinct from current_owner::text then
    raise exception 'Portfolio owner denied' using errcode = '42501';
  end if;
  if expected_revision is null or expected_revision < 0 or (candidate->>'revision')::integer is distinct from expected_revision + 1 then
    raise exception 'Portfolio revision invalid' using errcode = '22023';
  end if;
  if expected_revision = 0 then
    insert into portfolio.drafts(id, owner_id, payload, created_at, updated_at, record_version)
    values ((candidate->>'id')::uuid, current_owner, candidate, (candidate->>'createdAt')::timestamptz, (candidate->>'updatedAt')::timestamptz, 1)
    on conflict (owner_id) do nothing;
  else
    update portfolio.drafts set payload = candidate, updated_at = (candidate->>'updatedAt')::timestamptz, record_version = record_version + 1
    where id = (candidate->>'id')::uuid and owner_id = current_owner and record_version = expected_revision and deleted_at is null;
  end if;
  get diagnostics affected = row_count;
  return affected = 1;
end;
$$;
revoke all on function portfolio.save_draft(jsonb, integer) from public, anon;
grant execute on function portfolio.save_draft(jsonb, integer) to authenticated;

-- Supabase's managed server role reads the curated snapshot only through the server publication gate.
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant usage on schema portfolio to service_role';
    execute 'grant select on portfolio.drafts to service_role';
  end if;
end $$;

insert into platform.migration_audit(version, scope, name) values ('20261007001000', 'portfolio', 'curated_private_portfolio');
commit;
