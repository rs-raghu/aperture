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
  gpa_scale
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
  10
);

commit;
