begin;

alter table platform.user_preferences
  add column unit_preferences jsonb not null default '{"measurementSystem":"metric","temperatureUnit":"celsius","distanceUnit":"kilometres","massUnit":"kilograms"}'::jsonb,
  add column calculator_defaults jsonb not null default '{}'::jsonb,
  add column feature_enablement jsonb not null default '{}'::jsonb,
  add column dashboard_widgets jsonb not null default '{}'::jsonb,
  add column privacy_controls jsonb not null default '{"usageAnalytics":false,"crashReports":false,"personalizedInsights":false,"integrationDataSharing":false}'::jsonb,
  add column platform_preferences jsonb not null default '{"web":{"compactNavigation":false,"reduceMotion":false},"mobile":{"haptics":true,"reduceMotion":false}}'::jsonb,
  add constraint platform_preferences_units_object check (jsonb_typeof(unit_preferences) = 'object'),
  add constraint platform_preferences_calculators_object check (jsonb_typeof(calculator_defaults) = 'object'),
  add constraint platform_preferences_features_object check (jsonb_typeof(feature_enablement) = 'object'),
  add constraint platform_preferences_widgets_object check (jsonb_typeof(dashboard_widgets) = 'object'),
  add constraint platform_preferences_privacy_object check (jsonb_typeof(privacy_controls) = 'object'),
  add constraint platform_preferences_platform_object check (jsonb_typeof(platform_preferences) = 'object');

update platform.user_preferences
set payload = payload || jsonb_build_object(
  'id', id,
  'ownerId', owner_id,
  'createdAt', created_at,
  'updatedAt', updated_at,
  'theme', theme,
  'locale', locale,
  'timeZone', time_zone,
  'currency', currency,
  'dateFormat', date_format,
  'units', unit_preferences,
  'weekStartDay', week_start_day,
  'fiscalYear', jsonb_build_object('startMonth', financial_year_start_month, 'startDay', financial_year_start_day),
  'gpaScale', gpa_scale,
  'calculatorDefaults', calculator_defaults,
  'featureEnablement', feature_enablement,
  'dashboardWidgets', dashboard_widgets,
  'privacy', privacy_controls,
  'platform', platform_preferences
);

create index platform_integrations_owner_status_idx
  on platform.integration_connections (owner_id, status, integration_id)
  where deleted_at is null;

revoke all privileges on table platform.integration_credentials from authenticated;

insert into platform.migration_audit (version, scope, name)
values ('20260922002000', 'settings', 'settings-and-privacy');

commit;
