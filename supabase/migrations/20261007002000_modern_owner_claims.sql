begin;

-- PostgREST supplies one JSON claims GUC. Legacy clients remain supported only
-- when that GUC is absent; a missing modern sub must never inherit a stale sub.
create or replace function app_private.current_owner_id()
returns uuid language sql stable set search_path = pg_catalog
as $$
  select (case
    when nullif(current_setting('request.jwt.claims', true), '') is not null
      then nullif(current_setting('request.jwt.claims', true)::jsonb->>'sub', '')
    else nullif(current_setting('request.jwt.claim.sub', true), '')
  end)::uuid
$$;
revoke execute on function app_private.current_owner_id() from public, anon;
grant execute on function app_private.current_owner_id() to authenticated;

insert into platform.migration_audit(version, scope, name)
values ('20261007002000', 'core', 'modern_owner_claims');
commit;
