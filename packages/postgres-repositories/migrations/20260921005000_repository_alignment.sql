begin;

select app_private.create_owned_record_table('health', 'equipment_usage');
alter table health.equipment_usage
  add column equipment_id uuid not null,
  add column used_at timestamptz not null,
  add constraint health_equipment_usage_equipment_fk
    foreign key (owner_id, equipment_id) references health.equipment (owner_id, id);
create index health_equipment_usage_owner_equipment_time_idx
  on health.equipment_usage (owner_id, equipment_id, used_at desc, id)
  where deleted_at is null;

alter table education.institutions drop constraint institutions_status_check;
alter table education.institutions add constraint institutions_status_check
  check (status in ('planned', 'active', 'completed', 'archived'));

alter table education.assignments drop constraint assignments_status_check;
alter table education.assignments add constraint assignments_status_check
  check (status in ('draft', 'assigned', 'submitted', 'completed', 'cancelled'));

alter table education.exams drop constraint exams_status_check;
alter table education.exams add constraint exams_status_check
  check (status in ('scheduled', 'completed', 'cancelled'));

alter table education.study_sessions drop constraint study_sessions_status_check;
alter table education.study_sessions add constraint study_sessions_status_check
  check (status in ('scheduled', 'in_progress', 'paused', 'completed', 'cancelled'));

alter table finance.recurring_transactions
  alter column transaction_type drop not null;

alter table finance.trades
  add column holding_id uuid,
  alter column investment_account_id drop not null,
  alter column symbol drop not null,
  alter column unit_price drop not null,
  alter column currency drop not null,
  add constraint finance_trades_holding_fk
    foreign key (owner_id, holding_id) references finance.holdings (owner_id, id);
alter table finance.trades drop constraint trades_trade_type_check;
alter table finance.trades add constraint trades_trade_type_check
  check (trade_type in ('buy', 'sell', 'bonus', 'split', 'transfer', 'adjustment'));

alter table finance.dividends
  add column holding_id uuid,
  alter column investment_account_id drop not null,
  alter column symbol drop not null,
  add constraint finance_dividends_holding_fk
    foreign key (owner_id, holding_id) references finance.holdings (owner_id, id);

alter table finance.tax_profiles
  add column currency char(3) check (currency is null or currency ~ '^[A-Z]{3}$'),
  alter column financial_year drop not null,
  alter column rule_version drop not null,
  alter column rule_effective_on drop not null;

alter table finance.financial_imports
  add column file_name text,
  alter column source_type drop not null,
  alter column source_name drop not null;

alter table finance.financial_documents
  add column status text not null default 'active',
  alter column storage_key drop not null;

alter table finance.accounts drop constraint accounts_status_check;
alter table finance.accounts add constraint accounts_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.categories drop constraint categories_status_check;
alter table finance.categories add constraint categories_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.transactions drop constraint transactions_status_check;
alter table finance.transactions add constraint transactions_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.budgets drop constraint budgets_status_check;
alter table finance.budgets add constraint budgets_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.recurring_transactions drop constraint recurring_transactions_status_check;
alter table finance.recurring_transactions add constraint recurring_transactions_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.income_sources drop constraint income_sources_status_check;
alter table finance.income_sources add constraint income_sources_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.assets drop constraint assets_status_check;
alter table finance.assets add constraint assets_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.liabilities drop constraint liabilities_status_check;
alter table finance.liabilities add constraint liabilities_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.investment_accounts drop constraint investment_accounts_status_check;
alter table finance.investment_accounts add constraint investment_accounts_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.loans drop constraint loans_status_check;
alter table finance.loans add constraint loans_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.tax_profiles drop constraint tax_profiles_status_check;
alter table finance.tax_profiles add constraint tax_profiles_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.insurance_policies drop constraint insurance_policies_status_check;
alter table finance.insurance_policies add constraint insurance_policies_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.financial_goals drop constraint financial_goals_status_check;
alter table finance.financial_goals add constraint financial_goals_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.financial_imports drop constraint financial_imports_status_check;
alter table finance.financial_imports add constraint financial_imports_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));
alter table finance.financial_documents add constraint financial_documents_status_check
  check (status in ('draft', 'active', 'paused', 'completed', 'closed', 'archived', 'cancelled'));

insert into platform.migration_audit (version, scope, name)
values ('20260921005000', 'postgres-repositories', 'repository-alignment');

commit;
