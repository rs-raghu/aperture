begin;

create schema strava;
select app_private.create_owned_record_table('strava', 'connections');
select app_private.create_owned_record_table('strava', 'credentials');
select app_private.create_owned_record_table('strava', 'oauth_states');
select app_private.create_owned_record_table('strava', 'activity_imports');
select app_private.create_owned_record_table('strava', 'webhook_events');
select app_private.create_owned_record_table('strava', 'webhook_limits');

alter table strava.connections
  add constraint strava_connection_owner_unique unique (owner_id),
  add column integration_connection_id uuid not null references platform.integration_connections(id) on delete cascade;
alter table strava.credentials add constraint strava_credentials_owner_unique unique (owner_id), add column ciphertext text not null;
alter table strava.oauth_states add constraint strava_state_owner_unique unique (owner_id), add column state_digest text not null, add column expires_at timestamptz not null;
alter table strava.activity_imports
  add column athlete_id text not null check (athlete_id ~ '^[0-9]+$'),
  add column activity_id text not null check (activity_id ~ '^[0-9]+$'),
  add column health_record_id uuid not null,
  add constraint strava_source_unique unique (owner_id, athlete_id, activity_id);
alter table strava.webhook_events
  add column event_digest text not null,
  add column attempts integer not null default 0 check (attempts >= 0),
  add column state text not null default 'pending' check (state in ('pending','processed','failed')),
  add constraint strava_event_unique unique (owner_id, event_digest);
create index strava_pending_events_idx on strava.webhook_events(owner_id, state, created_at, id);
alter table strava.webhook_limits add constraint strava_limits_owner_unique unique (owner_id), add constraint strava_limits_connection foreign key (owner_id) references strava.connections(owner_id) on delete cascade;
create index strava_health_source_idx on health.running_activities(owner_id, (payload->'sourceReference'->>'accountId'), (payload->'sourceReference'->>'recordId')) where payload->'sourceReference'->>'provider' = 'strava';

-- Removing/replacing Settings cascades to every private integration record, including encrypted tokens.
alter table strava.credentials add constraint strava_credentials_connection foreign key (owner_id) references strava.connections(owner_id) on delete cascade;
alter table strava.oauth_states add constraint strava_states_connection foreign key (owner_id) references strava.connections(owner_id) on delete cascade;
alter table strava.activity_imports add constraint strava_imports_connection foreign key (owner_id) references strava.connections(owner_id) on delete cascade;
alter table strava.webhook_events add constraint strava_events_connection foreign key (owner_id) references strava.connections(owner_id) on delete cascade;

-- Only the server database role accesses integration data. Clients read sanitized platform status.
revoke all on schema strava from public, anon, authenticated;
revoke all on all tables in schema strava from public, anon, authenticated;

insert into platform.migration_audit(version, scope, name) values ('20261007000000', 'strava', 'optional_strava_integration');
commit;
