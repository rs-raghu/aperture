begin;

alter table platform.export_jobs
  add column scope jsonb not null default '{"kind":"full","featureIds":[]}'::jsonb,
  add column record_count integer check (record_count is null or record_count >= 0),
  add column privacy_warning text;

alter table platform.backup_manifests
  add column scope jsonb not null default '{"kind":"full","featureIds":[]}'::jsonb,
  add column record_count integer not null default 0 check (record_count >= 0);

create index platform_backups_owner_created_idx
  on platform.backup_manifests (owner_id, created_at_source desc, id)
  where deleted_at is null;

insert into platform.migration_audit (version, scope, name)
values ('20260922003000', 'backup', 'backup_metadata');

commit;
