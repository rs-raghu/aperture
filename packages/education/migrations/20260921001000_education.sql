begin;

select app_private.create_owned_record_table('education', 'institutions');
select app_private.create_owned_record_table('education', 'programs');
select app_private.create_owned_record_table('education', 'semesters');
select app_private.create_owned_record_table('education', 'courses');
select app_private.create_owned_record_table('education', 'topics');
select app_private.create_owned_record_table('education', 'assignments');
select app_private.create_owned_record_table('education', 'exams');
select app_private.create_owned_record_table('education', 'grades');
select app_private.create_owned_record_table('education', 'attendance');
select app_private.create_owned_record_table('education', 'study_sessions');
select app_private.create_owned_record_table('education', 'schedules');
select app_private.create_owned_record_table('education', 'resources');
select app_private.create_owned_record_table('education', 'certificates');
select app_private.create_owned_record_table('education', 'goals');

alter table education.institutions
  add column name text not null,
  add column status text not null default 'active' check (status in ('active', 'archived'));
create unique index institutions_owner_name_uq on education.institutions (owner_id, lower(name)) where deleted_at is null;

alter table education.programs
  add column institution_id uuid,
  add column name text not null,
  add column status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  add constraint programs_institution_fk foreign key (owner_id, institution_id) references education.institutions (owner_id, id);
create unique index programs_owner_name_uq on education.programs (owner_id, lower(name)) where deleted_at is null;

alter table education.semesters
  add column program_id uuid,
  add column name text not null,
  add column starts_on date,
  add column ends_on date,
  add column status text not null default 'planned' check (status in ('planned', 'active', 'completed', 'archived')),
  add constraint semesters_program_fk foreign key (owner_id, program_id) references education.programs (owner_id, id),
  add constraint semesters_date_order check (starts_on is null or ends_on is null or starts_on <= ends_on);
create index semesters_owner_dates_idx on education.semesters (owner_id, starts_on, ends_on);

alter table education.courses
  add column program_id uuid,
  add column semester_id uuid,
  add column code text,
  add column name text not null,
  add column credits numeric(20, 8),
  add column starts_on date,
  add column ends_on date,
  add column status text not null default 'planned' check (status in ('planned', 'active', 'completed', 'dropped', 'archived')),
  add constraint courses_program_fk foreign key (owner_id, program_id) references education.programs (owner_id, id),
  add constraint courses_semester_fk foreign key (owner_id, semester_id) references education.semesters (owner_id, id),
  add constraint courses_credits_nonnegative check (credits is null or credits >= 0),
  add constraint courses_date_order check (starts_on is null or ends_on is null or starts_on <= ends_on);
create unique index courses_owner_code_uq on education.courses (owner_id, lower(code)) where code is not null and deleted_at is null;

alter table education.topics
  add column course_id uuid not null,
  add column name text not null,
  add column sequence integer check (sequence is null or sequence > 0),
  add constraint topics_course_fk foreign key (owner_id, course_id) references education.courses (owner_id, id);
create index topics_owner_course_idx on education.topics (owner_id, course_id, sequence);

alter table education.assignments
  add column course_id uuid not null,
  add column title text not null,
  add column due_at timestamptz,
  add column max_points numeric(20, 8),
  add column status text not null default 'planned' check (status in ('planned', 'in_progress', 'submitted', 'graded', 'completed', 'cancelled', 'archived')),
  add constraint assignments_course_fk foreign key (owner_id, course_id) references education.courses (owner_id, id),
  add constraint assignments_max_points_positive check (max_points is null or max_points > 0);
create index assignments_owner_due_idx on education.assignments (owner_id, due_at, id) where deleted_at is null;

alter table education.exams
  add column course_id uuid not null,
  add column title text not null,
  add column scheduled_at timestamptz,
  add column max_points numeric(20, 8),
  add column status text not null default 'planned' check (status in ('planned', 'completed', 'graded', 'cancelled', 'archived')),
  add constraint exams_course_fk foreign key (owner_id, course_id) references education.courses (owner_id, id),
  add constraint exams_max_points_positive check (max_points is null or max_points > 0);
create index exams_owner_scheduled_idx on education.exams (owner_id, scheduled_at, id) where deleted_at is null;

alter table education.grades
  add column course_id uuid not null,
  add column assignment_id uuid,
  add column exam_id uuid,
  add column points_earned numeric(20, 8),
  add column points_possible numeric(20, 8),
  add column grade_points numeric(20, 8),
  add column recorded_at timestamptz not null,
  add constraint grades_course_fk foreign key (owner_id, course_id) references education.courses (owner_id, id),
  add constraint grades_assignment_fk foreign key (owner_id, assignment_id) references education.assignments (owner_id, id),
  add constraint grades_exam_fk foreign key (owner_id, exam_id) references education.exams (owner_id, id),
  add constraint grades_one_source check (num_nonnulls(assignment_id, exam_id) <= 1),
  add constraint grades_points_nonnegative check (points_earned is null or points_earned >= 0),
  add constraint grades_possible_positive check (points_possible is null or points_possible > 0);
create index grades_owner_recorded_idx on education.grades (owner_id, recorded_at desc, id);

alter table education.attendance
  add column course_id uuid not null,
  add column occurred_on date not null,
  add column status text not null check (status in ('present', 'absent', 'late', 'excused', 'cancelled')),
  add constraint attendance_course_fk foreign key (owner_id, course_id) references education.courses (owner_id, id),
  add constraint attendance_owner_course_date_uq unique (owner_id, course_id, occurred_on);
create index attendance_owner_date_idx on education.attendance (owner_id, occurred_on desc, id);

alter table education.study_sessions
  add column course_id uuid,
  add column topic_id uuid,
  add column started_at timestamptz not null,
  add column ended_at timestamptz,
  add column duration_minutes numeric(20, 8),
  add column status text not null default 'planned' check (status in ('planned', 'in_progress', 'paused', 'completed', 'cancelled')),
  add constraint study_sessions_course_fk foreign key (owner_id, course_id) references education.courses (owner_id, id),
  add constraint study_sessions_topic_fk foreign key (owner_id, topic_id) references education.topics (owner_id, id),
  add constraint study_sessions_time_order check (ended_at is null or ended_at >= started_at),
  add constraint study_sessions_duration_nonnegative check (duration_minutes is null or duration_minutes >= 0);
create index study_sessions_owner_started_idx on education.study_sessions (owner_id, started_at desc, id);

alter table education.schedules
  add column course_id uuid,
  add column title text not null,
  add column starts_at timestamptz not null,
  add column ends_at timestamptz,
  add column recurrence_rule text,
  add constraint schedules_course_fk foreign key (owner_id, course_id) references education.courses (owner_id, id),
  add constraint schedules_time_order check (ends_at is null or ends_at >= starts_at);
create index schedules_owner_starts_idx on education.schedules (owner_id, starts_at, id);

alter table education.resources
  add column course_id uuid,
  add column topic_id uuid,
  add column title text not null,
  add column resource_type text not null,
  add column resource_url text,
  add constraint resources_course_fk foreign key (owner_id, course_id) references education.courses (owner_id, id),
  add constraint resources_topic_fk foreign key (owner_id, topic_id) references education.topics (owner_id, id);

alter table education.certificates
  add column institution_id uuid,
  add column program_id uuid,
  add column name text not null,
  add column issued_on date,
  add column expires_on date,
  add constraint certificates_institution_fk foreign key (owner_id, institution_id) references education.institutions (owner_id, id),
  add constraint certificates_program_fk foreign key (owner_id, program_id) references education.programs (owner_id, id),
  add constraint certificates_date_order check (issued_on is null or expires_on is null or issued_on <= expires_on);

alter table education.goals
  add column course_id uuid,
  add column title text not null,
  add column target_value numeric(20, 8),
  add column current_value numeric(20, 8),
  add column due_on date,
  add column status text not null default 'active' check (status in ('draft', 'active', 'completed', 'archived')),
  add constraint goals_course_fk foreign key (owner_id, course_id) references education.courses (owner_id, id),
  add constraint goals_target_positive check (target_value is null or target_value > 0),
  add constraint goals_current_nonnegative check (current_value is null or current_value >= 0);
create index education_goals_owner_due_idx on education.goals (owner_id, due_on, id) where deleted_at is null;

insert into platform.migration_audit (version, scope, name)
values ('20260921001000', 'education', 'education');

commit;
