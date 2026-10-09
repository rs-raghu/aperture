begin;

create or replace function portfolio.save_draft(candidate jsonb, expected_revision integer) returns boolean
language plpgsql security invoker set search_path = pg_catalog, portfolio
as $$
declare affected integer; current_owner uuid := (case when nullif(current_setting('request.jwt.claims', true), '') is not null then nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub', '') else nullif(current_setting('request.jwt.claim.sub', true), '') end)::uuid;
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

insert into platform.migration_audit(version, scope, name)
values ('20261007002100', 'portfolio', 'modern_owner_claims_rpc');
commit;
