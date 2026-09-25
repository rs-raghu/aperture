-- Synthetic development seed only. This UUID and address do not identify a person.
begin;

insert into platform.user_profiles (id, owner_id, email, display_name)
values (
  '70000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000001',
  'synthetic-owner@example.invalid',
  'Synthetic Owner'
);

insert into platform.user_preferences (
  id,
  owner_id,
  locale,
  time_zone,
  currency,
  date_format,
  week_start_day,
  measurement_system,
  theme,
  financial_year_start_month,
  financial_year_start_day,
  gpa_scale,
  created_at,
  updated_at,
  payload
)
values (
  '70000000-0000-4000-8000-000000000002',
  '70000000-0000-4000-8000-000000000001',
  'en',
  'UTC',
  'USD',
  'year-month-day',
  'monday',
  'metric',
  'system',
  1,
  1,
  10,
  '2040-01-01T08:00:00.000Z',
  '2040-01-01T08:00:00.000Z',
  '{"id":"70000000-0000-4000-8000-000000000002","ownerId":"70000000-0000-4000-8000-000000000001","createdAt":"2040-01-01T08:00:00.000Z","updatedAt":"2040-01-01T08:00:00.000Z","theme":"system","locale":"en","timeZone":"UTC","currency":"USD","dateFormat":"year-month-day","units":{"measurementSystem":"metric","temperatureUnit":"celsius","distanceUnit":"kilometres","massUnit":"kilograms"},"weekStartDay":"monday","fiscalYear":{"startMonth":1,"startDay":1},"gpaScale":10,"calculatorDefaults":{},"featureEnablement":{},"dashboardWidgets":{},"privacy":{"usageAnalytics":false,"crashReports":false,"personalizedInsights":false,"integrationDataSharing":false},"platform":{"web":{"compactNavigation":false,"reduceMotion":false},"mobile":{"haptics":true,"reduceMotion":false}}}'::jsonb
);

commit;
