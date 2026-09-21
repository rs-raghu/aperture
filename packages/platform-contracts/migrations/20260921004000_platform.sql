begin;

select app_private.create_owned_record_table('platform', 'user_profiles');
select app_private.create_owned_record_table('platform', 'user_preferences');
select app_private.create_owned_record_table('platform', 'synchronization_status');
select app_private.create_owned_record_table('platform', 'synchronization_events');
select app_private.create_owned_record_table('platform', 'integration_connections');
select app_private.create_owned_record_table('platform', 'integration_credentials');
select app_private.create_owned_record_table('platform', 'export_jobs');
select app_private.create_owned_record_table('platform', 'backup_manifests');
select app_private.create_owned_record_table('planner', 'plans');
select app_private.create_owned_record_table('planner', 'items');
select app_private.create_owned_record_table('planner', 'item_links');

alter table platform.user_profiles
  add column email text not null,
  add column display_name text;
create unique index platform_profiles_owner_uq on platform.user_profiles (owner_id) where deleted_at is null;
create unique index platform_profiles_email_uq on platform.user_profiles (lower(email)) where deleted_at is null;

alter table platform.user_preferences
  add column locale text not null default 'en',
  add column time_zone text not null default 'UTC',
  add column currency char(3) not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  add column date_format text not null default 'locale-default' check (date_format in ('locale-default', 'day-month-year', 'month-day-year', 'year-month-day')),
  add column week_start_day text not null default 'monday' check (week_start_day in ('monday', 'sunday')),
  add column measurement_system text not null default 'metric' check (measurement_system in ('metric', 'imperial')),
  add column theme text not null default 'system' check (theme in ('system', 'light', 'dark')),
  add column financial_year_start_month integer not null default 1 check (financial_year_start_month between 1 and 12),
  add column financial_year_start_day integer not null default 1 check (financial_year_start_day between 1 and 31),
  add column gpa_scale numeric(20, 8) not null default 10 check (gpa_scale > 0);
create unique index platform_preferences_owner_uq on platform.user_preferences (owner_id) where deleted_at is null;

alter table platform.synchronization_status
  add column scope text not null check (scope in ('education', 'health', 'finance', 'platform')),
  add column state text not null default 'idle' check (state in ('idle', 'requested', 'running', 'succeeded', 'failed')),
  add column last_succeeded_at timestamptz,
  add column last_failed_at timestamptz,
  add column cursor text;
create unique index platform_sync_status_owner_scope_uq on platform.synchronization_status (owner_id, scope) where deleted_at is null;

alter table platform.synchronization_events
  add column scope text not null check (scope in ('education', 'health', 'finance', 'platform')),
  add column state text not null check (state in ('idle', 'requested', 'running', 'succeeded', 'failed')),
  add column occurred_at timestamptz not null,
  add column error_code text;
create index platform_sync_events_owner_time_idx on platform.synchronization_events (owner_id, occurred_at desc, id);

alter table platform.integration_connections
  add column integration_id text not null,
  add column status text not null default 'available' check (status in ('available', 'connecting', 'connected', 'disconnected', 'error')),
  add column connected_at timestamptz,
  add column last_synchronized_at timestamptz,
  add column last_error_code text;
create unique index platform_integrations_owner_id_uq on platform.integration_connections (owner_id, integration_id) where deleted_at is null;

alter table platform.integration_credentials
  add column connection_id uuid not null,
  add column credential_kind text not null,
  add column ciphertext bytea not null,
  add column expires_at timestamptz,
  add constraint platform_credentials_connection_fk foreign key (owner_id, connection_id) references platform.integration_connections (owner_id, id),
  add constraint platform_credentials_owner_kind_uq unique (owner_id, connection_id, credential_kind);
revoke select (ciphertext) on platform.integration_credentials from public;

alter table platform.export_jobs
  add column export_format text not null check (export_format in ('json', 'csv', 'zip')),
  add column status text not null default 'requested' check (status in ('requested', 'running', 'completed', 'failed', 'expired')),
  add column requested_at timestamptz not null,
  add column completed_at timestamptz,
  add column storage_key text,
  add column content_checksum text,
  add constraint platform_export_time_order check (completed_at is null or completed_at >= requested_at);
create index platform_exports_owner_time_idx on platform.export_jobs (owner_id, requested_at desc, id);

alter table platform.backup_manifests
  add column format_version text not null,
  add column created_at_source timestamptz not null,
  add column content_checksum text not null,
  add column storage_key text not null;
create unique index platform_backups_owner_checksum_uq on platform.backup_manifests (owner_id, content_checksum) where deleted_at is null;

alter table planner.plans
  add column title text not null,
  add column starts_on date,
  add column ends_on date,
  add column status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  add constraint planner_plans_date_order check (starts_on is null or ends_on is null or starts_on <= ends_on);
create index planner_plans_owner_dates_idx on planner.plans (owner_id, starts_on, ends_on, id);

alter table planner.items
  add column plan_id uuid,
  add column title text not null,
  add column item_type text not null check (item_type in ('task', 'event', 'reminder', 'focus')),
  add column status text not null default 'planned' check (status in ('planned', 'in_progress', 'completed', 'cancelled', 'archived')),
  add column scheduled_for date,
  add column starts_at timestamptz,
  add column ends_at timestamptz,
  add column priority integer check (priority is null or priority between 0 and 4),
  add constraint planner_items_plan_fk foreign key (owner_id, plan_id) references planner.plans (owner_id, id),
  add constraint planner_items_time_order check (starts_at is null or ends_at is null or starts_at <= ends_at);
create index planner_items_owner_schedule_idx on planner.items (owner_id, scheduled_for, starts_at, id) where deleted_at is null;

alter table planner.item_links
  add column planner_item_id uuid not null,
  add column target_scope text not null check (target_scope in ('education', 'health', 'finance', 'platform')),
  add column target_id uuid not null,
  add constraint planner_item_links_item_fk foreign key (owner_id, planner_item_id) references planner.items (owner_id, id),
  add constraint planner_item_links_owner_target_uq unique (owner_id, planner_item_id, target_scope, target_id);

insert into platform.migration_audit (version, scope, name)
values ('20260921004000', 'platform-contracts', 'platform');

commit;
