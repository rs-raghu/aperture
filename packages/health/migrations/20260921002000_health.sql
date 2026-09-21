begin;

select app_private.create_owned_record_table('health', 'profiles');
select app_private.create_owned_record_table('health', 'measurements');
select app_private.create_owned_record_table('health', 'vital_readings');
select app_private.create_owned_record_table('health', 'body_composition');
select app_private.create_owned_record_table('health', 'sleep_records');
select app_private.create_owned_record_table('health', 'nutrition_entries');
select app_private.create_owned_record_table('health', 'hydration_entries');
select app_private.create_owned_record_table('health', 'medications');
select app_private.create_owned_record_table('health', 'medication_logs');
select app_private.create_owned_record_table('health', 'symptom_entries');
select app_private.create_owned_record_table('health', 'appointments');
select app_private.create_owned_record_table('health', 'laboratory_results');
select app_private.create_owned_record_table('health', 'exercises');
select app_private.create_owned_record_table('health', 'workout_plans');
select app_private.create_owned_record_table('health', 'workout_sessions');
select app_private.create_owned_record_table('health', 'exercise_sets');
select app_private.create_owned_record_table('health', 'activity_routes');
select app_private.create_owned_record_table('health', 'equipment');
select app_private.create_owned_record_table('health', 'running_activities');
select app_private.create_owned_record_table('health', 'running_splits');
select app_private.create_owned_record_table('health', 'personal_records');
select app_private.create_owned_record_table('health', 'recovery_entries');

alter table health.profiles
  add column birth_date date,
  add column measurement_system text not null check (measurement_system in ('metric', 'imperial'));
create unique index health_profiles_one_per_owner_uq on health.profiles (owner_id) where deleted_at is null;

alter table health.measurements
  add column measurement_type text not null,
  add column measured_value numeric(30, 12) not null,
  add column unit text not null,
  add column observed_at timestamptz not null;
create index health_measurements_owner_type_time_idx on health.measurements (owner_id, measurement_type, observed_at desc, id);

alter table health.vital_readings
  add column vital_type text not null,
  add column primary_value numeric(30, 12) not null,
  add column secondary_value numeric(30, 12),
  add column unit text not null,
  add column observed_at timestamptz not null;
create index health_vitals_owner_type_time_idx on health.vital_readings (owner_id, vital_type, observed_at desc, id);

alter table health.body_composition
  add column metric_type text not null,
  add column metric_value numeric(30, 12) not null,
  add column unit text not null,
  add column observed_at timestamptz not null;
create index health_body_composition_owner_time_idx on health.body_composition (owner_id, observed_at desc, id);

alter table health.sleep_records
  add column started_at timestamptz not null,
  add column ended_at timestamptz not null,
  add column duration_minutes numeric(20, 8) not null,
  add column quality text,
  add constraint sleep_records_time_order check (ended_at > started_at),
  add constraint sleep_records_duration_positive check (duration_minutes > 0);
create index health_sleep_owner_start_idx on health.sleep_records (owner_id, started_at desc, id);

alter table health.nutrition_entries
  add column title text not null,
  add column meal_type text not null,
  add column consumed_at timestamptz not null,
  add column energy_kilocalories numeric(30, 12),
  add constraint nutrition_energy_nonnegative check (energy_kilocalories is null or energy_kilocalories >= 0);
create index health_nutrition_owner_consumed_idx on health.nutrition_entries (owner_id, consumed_at desc, id);

alter table health.hydration_entries
  add column volume_milliliters numeric(30, 12) not null,
  add column consumed_at timestamptz not null,
  add constraint hydration_volume_positive check (volume_milliliters > 0);
create index health_hydration_owner_consumed_idx on health.hydration_entries (owner_id, consumed_at desc, id);

alter table health.medications
  add column name text not null,
  add column dosage_value numeric(30, 12),
  add column dosage_unit text,
  add column status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived'));
create unique index health_medications_owner_name_uq on health.medications (owner_id, lower(name)) where deleted_at is null;

alter table health.medication_logs
  add column medication_id uuid not null,
  add column logged_at timestamptz not null,
  add column status text not null check (status in ('taken', 'skipped', 'missed')),
  add constraint medication_logs_medication_fk foreign key (owner_id, medication_id) references health.medications (owner_id, id);
create index health_medication_logs_owner_time_idx on health.medication_logs (owner_id, logged_at desc, id);

alter table health.symptom_entries
  add column symptom text not null,
  add column severity numeric(5, 2),
  add column observed_at timestamptz not null,
  add constraint symptom_severity_range check (severity is null or severity between 0 and 10);
create index health_symptoms_owner_time_idx on health.symptom_entries (owner_id, observed_at desc, id);

alter table health.appointments
  add column title text not null,
  add column starts_at timestamptz not null,
  add column ends_at timestamptz,
  add column status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'cancelled', 'archived')),
  add constraint appointments_time_order check (ends_at is null or ends_at >= starts_at);
create index health_appointments_owner_start_idx on health.appointments (owner_id, starts_at, id);

alter table health.laboratory_results
  add column test_name text not null,
  add column result_value numeric(30, 12),
  add column result_text text,
  add column unit text,
  add column observed_at timestamptz not null,
  add constraint laboratory_result_present check (num_nonnulls(result_value, result_text) >= 1);
create index health_laboratory_owner_time_idx on health.laboratory_results (owner_id, observed_at desc, id);

alter table health.exercises
  add column name text not null,
  add column category text not null;
create unique index health_exercises_owner_name_uq on health.exercises (owner_id, lower(name)) where deleted_at is null;

alter table health.workout_plans
  add column title text not null,
  add column status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed', 'archived'));

alter table health.workout_sessions
  add column workout_plan_id uuid,
  add column title text not null,
  add column status text not null default 'planned' check (status in ('planned', 'in_progress', 'paused', 'completed', 'cancelled')),
  add column started_at timestamptz,
  add column ended_at timestamptz,
  add constraint workout_sessions_plan_fk foreign key (owner_id, workout_plan_id) references health.workout_plans (owner_id, id),
  add constraint workout_sessions_time_order check (started_at is null or ended_at is null or ended_at >= started_at);
create index health_workout_sessions_owner_time_idx on health.workout_sessions (owner_id, started_at desc nulls last, id);

alter table health.exercise_sets
  add column workout_session_id uuid not null,
  add column exercise_id uuid not null,
  add column sequence integer not null check (sequence > 0),
  add column repetitions numeric(20, 8),
  add column weight_value numeric(30, 12),
  add column weight_unit text,
  add constraint exercise_sets_session_fk foreign key (owner_id, workout_session_id) references health.workout_sessions (owner_id, id),
  add constraint exercise_sets_exercise_fk foreign key (owner_id, exercise_id) references health.exercises (owner_id, id),
  add constraint exercise_sets_repetitions_nonnegative check (repetitions is null or repetitions >= 0),
  add constraint exercise_sets_weight_nonnegative check (weight_value is null or weight_value >= 0),
  add constraint exercise_sets_owner_sequence_uq unique (owner_id, workout_session_id, sequence);

alter table health.activity_routes
  add column title text not null,
  add column distance_value numeric(30, 12),
  add column distance_unit text,
  add constraint activity_routes_distance_nonnegative check (distance_value is null or distance_value >= 0);

alter table health.equipment
  add column name text not null,
  add column category text not null,
  add column status text not null default 'active' check (status in ('active', 'retired', 'archived'));
create unique index health_equipment_owner_name_uq on health.equipment (owner_id, lower(name)) where deleted_at is null;

alter table health.running_activities
  add column activity_route_id uuid,
  add column title text not null,
  add column status text not null default 'planned' check (status in ('planned', 'in_progress', 'paused', 'completed', 'cancelled')),
  add column started_at timestamptz not null,
  add column ended_at timestamptz,
  add column distance_value numeric(30, 12),
  add column distance_unit text,
  add column duration_minutes numeric(30, 12),
  add constraint running_activities_route_fk foreign key (owner_id, activity_route_id) references health.activity_routes (owner_id, id),
  add constraint running_activities_time_order check (ended_at is null or ended_at >= started_at),
  add constraint running_activities_distance_nonnegative check (distance_value is null or distance_value >= 0),
  add constraint running_activities_duration_nonnegative check (duration_minutes is null or duration_minutes >= 0);
create index health_running_owner_start_idx on health.running_activities (owner_id, started_at desc, id);

alter table health.running_splits
  add column running_activity_id uuid not null,
  add column sequence integer not null check (sequence > 0),
  add column distance_value numeric(30, 12) not null,
  add column distance_unit text not null,
  add column duration_minutes numeric(30, 12) not null,
  add constraint running_splits_activity_fk foreign key (owner_id, running_activity_id) references health.running_activities (owner_id, id),
  add constraint running_splits_distance_positive check (distance_value > 0),
  add constraint running_splits_duration_positive check (duration_minutes > 0),
  add constraint running_splits_owner_sequence_uq unique (owner_id, running_activity_id, sequence);

alter table health.personal_records
  add column title text not null,
  add column metric_type text not null,
  add column metric_value numeric(30, 12) not null,
  add column metric_unit text not null,
  add column achieved_at timestamptz not null;
create index health_personal_records_owner_time_idx on health.personal_records (owner_id, achieved_at desc, id);

alter table health.recovery_entries
  add column observed_at timestamptz not null,
  add column energy_score numeric(5, 2),
  add column fatigue_score numeric(5, 2),
  add constraint recovery_energy_range check (energy_score is null or energy_score between 1 and 10),
  add constraint recovery_fatigue_range check (fatigue_score is null or fatigue_score between 1 and 10);
create index health_recovery_owner_time_idx on health.recovery_entries (owner_id, observed_at desc, id);

insert into platform.migration_audit (version, scope, name)
values ('20260921002000', 'health', 'health');

commit;
