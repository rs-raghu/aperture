begin;

select app_private.create_owned_record_table('finance', 'accounts');
select app_private.create_owned_record_table('finance', 'transactions');
select app_private.create_owned_record_table('finance', 'transaction_splits');
select app_private.create_owned_record_table('finance', 'categories');
select app_private.create_owned_record_table('finance', 'budgets');
select app_private.create_owned_record_table('finance', 'budget_lines');
select app_private.create_owned_record_table('finance', 'recurring_transactions');
select app_private.create_owned_record_table('finance', 'income_sources');
select app_private.create_owned_record_table('finance', 'assets');
select app_private.create_owned_record_table('finance', 'liabilities');
select app_private.create_owned_record_table('finance', 'net_worth_snapshots');
select app_private.create_owned_record_table('finance', 'investment_accounts');
select app_private.create_owned_record_table('finance', 'holdings');
select app_private.create_owned_record_table('finance', 'trades');
select app_private.create_owned_record_table('finance', 'dividends');
select app_private.create_owned_record_table('finance', 'market_prices');
select app_private.create_owned_record_table('finance', 'loans');
select app_private.create_owned_record_table('finance', 'loan_payments');
select app_private.create_owned_record_table('finance', 'tax_profiles');
select app_private.create_owned_record_table('finance', 'tax_records');
select app_private.create_owned_record_table('finance', 'insurance_policies');
select app_private.create_owned_record_table('finance', 'financial_goals');
select app_private.create_owned_record_table('finance', 'financial_imports');
select app_private.create_owned_record_table('finance', 'financial_import_rows');
select app_private.create_owned_record_table('finance', 'financial_documents');
select app_private.create_owned_record_table('finance', 'calculator_scenarios');

alter table finance.accounts
  add column name text not null,
  add column account_type text not null,
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column status text not null default 'active' check (status in ('active', 'paused', 'closed', 'archived'));
create unique index finance_accounts_owner_name_uq on finance.accounts (owner_id, lower(name)) where deleted_at is null;

alter table finance.categories
  add column name text not null,
  add column category_kind text not null check (category_kind in ('income', 'expense', 'transfer')),
  add column status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  add column system_category boolean not null default false;
create unique index finance_categories_owner_name_kind_uq on finance.categories (owner_id, lower(name), category_kind) where deleted_at is null;

alter table finance.transactions
  add column account_id uuid not null,
  add column category_id uuid,
  add column description text not null,
  add column transaction_type text not null check (transaction_type in ('income', 'expense', 'transfer')),
  add column amount numeric(38, 18) not null check (amount > 0),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column occurred_at timestamptz not null,
  add column reviewed boolean not null default false,
  add column status text not null default 'active' check (status in ('active', 'void')),
  add constraint finance_transactions_account_fk foreign key (owner_id, account_id) references finance.accounts (owner_id, id),
  add constraint finance_transactions_category_fk foreign key (owner_id, category_id) references finance.categories (owner_id, id);
create index finance_transactions_owner_time_idx on finance.transactions (owner_id, occurred_at desc, id) where deleted_at is null;
create index finance_transactions_owner_account_idx on finance.transactions (owner_id, account_id, occurred_at desc, id);

alter table finance.transaction_splits
  add column transaction_id uuid not null,
  add column category_id uuid not null,
  add column amount numeric(38, 18) not null check (amount >= 0),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add constraint finance_splits_transaction_fk foreign key (owner_id, transaction_id) references finance.transactions (owner_id, id),
  add constraint finance_splits_category_fk foreign key (owner_id, category_id) references finance.categories (owner_id, id);
create index finance_splits_owner_transaction_idx on finance.transaction_splits (owner_id, transaction_id, id);

alter table finance.budgets
  add column name text not null,
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column period text not null check (period in ('month', 'quarter', 'year', 'custom')),
  add column starts_on date not null,
  add column ends_on date not null,
  add column status text not null default 'draft' check (status in ('draft', 'active', 'paused', 'completed', 'archived')),
  add constraint finance_budgets_date_order check (starts_on <= ends_on);
create unique index finance_budgets_owner_name_uq on finance.budgets (owner_id, lower(name)) where deleted_at is null;
create index finance_budgets_owner_dates_idx on finance.budgets (owner_id, starts_on, ends_on);

alter table finance.budget_lines
  add column budget_id uuid not null,
  add column category_id uuid not null,
  add column allocated_amount numeric(38, 18) not null check (allocated_amount >= 0),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add constraint finance_budget_lines_budget_fk foreign key (owner_id, budget_id) references finance.budgets (owner_id, id),
  add constraint finance_budget_lines_category_fk foreign key (owner_id, category_id) references finance.categories (owner_id, id),
  add constraint finance_budget_lines_owner_category_uq unique (owner_id, budget_id, category_id);

alter table finance.recurring_transactions
  add column account_id uuid not null,
  add column category_id uuid,
  add column description text not null,
  add column transaction_type text not null check (transaction_type in ('income', 'expense', 'transfer')),
  add column amount numeric(38, 18) not null check (amount > 0),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column recurrence_rule text not null,
  add column next_occurrence_on date,
  add column status text not null default 'active' check (status in ('active', 'paused', 'completed', 'archived')),
  add constraint finance_recurring_account_fk foreign key (owner_id, account_id) references finance.accounts (owner_id, id),
  add constraint finance_recurring_category_fk foreign key (owner_id, category_id) references finance.categories (owner_id, id);
create index finance_recurring_owner_next_idx on finance.recurring_transactions (owner_id, next_occurrence_on, id);

alter table finance.income_sources
  add column name text not null,
  add column amount numeric(38, 18),
  add column currency char(3) check (currency is null or currency ~ '^[A-Z]{3}$'),
  add column frequency text,
  add column status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  add constraint finance_income_amount_nonnegative check (amount is null or amount >= 0);
create unique index finance_income_sources_owner_name_uq on finance.income_sources (owner_id, lower(name)) where deleted_at is null;

alter table finance.assets
  add column name text not null,
  add column asset_type text not null,
  add column current_value numeric(38, 18) not null check (current_value >= 0),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column valued_on date not null,
  add column status text not null default 'active' check (status in ('active', 'paused', 'archived'));
create index finance_assets_owner_valued_idx on finance.assets (owner_id, valued_on desc, id);

alter table finance.liabilities
  add column name text not null,
  add column liability_type text not null,
  add column outstanding_balance numeric(38, 18) not null check (outstanding_balance >= 0),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column valued_on date not null,
  add column status text not null default 'active' check (status in ('active', 'paused', 'archived'));
create index finance_liabilities_owner_valued_idx on finance.liabilities (owner_id, valued_on desc, id);

alter table finance.net_worth_snapshots
  add column total_assets numeric(38, 18) not null,
  add column total_liabilities numeric(38, 18) not null,
  add column net_worth numeric(38, 18) not null,
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column recorded_on date not null,
  add constraint finance_net_worth_totals_nonnegative check (total_assets >= 0 and total_liabilities >= 0),
  add constraint finance_net_worth_arithmetic check (net_worth = total_assets - total_liabilities),
  add constraint finance_net_worth_owner_day_uq unique (owner_id, currency, recorded_on);

alter table finance.investment_accounts
  add column financial_account_id uuid,
  add column name text not null,
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  add constraint finance_investment_accounts_financial_fk foreign key (owner_id, financial_account_id) references finance.accounts (owner_id, id);
create unique index finance_investment_accounts_owner_name_uq on finance.investment_accounts (owner_id, lower(name)) where deleted_at is null;

alter table finance.holdings
  add column investment_account_id uuid not null,
  add column symbol text not null,
  add column quantity numeric(38, 18) not null check (quantity >= 0),
  add column average_unit_cost numeric(38, 18),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add constraint finance_holdings_account_fk foreign key (owner_id, investment_account_id) references finance.investment_accounts (owner_id, id),
  add constraint finance_holdings_cost_nonnegative check (average_unit_cost is null or average_unit_cost >= 0);
create unique index finance_holdings_owner_symbol_uq on finance.holdings (owner_id, investment_account_id, upper(symbol)) where deleted_at is null;

alter table finance.trades
  add column investment_account_id uuid not null,
  add column symbol text not null,
  add column trade_type text not null check (trade_type in ('buy', 'sell')),
  add column quantity numeric(38, 18) not null check (quantity > 0),
  add column unit_price numeric(38, 18) not null check (unit_price >= 0),
  add column fees numeric(38, 18) not null default 0 check (fees >= 0),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column traded_at timestamptz not null,
  add constraint finance_trades_account_fk foreign key (owner_id, investment_account_id) references finance.investment_accounts (owner_id, id);
create index finance_trades_owner_time_idx on finance.trades (owner_id, traded_at desc, id);

alter table finance.dividends
  add column investment_account_id uuid not null,
  add column symbol text not null,
  add column amount numeric(38, 18) not null check (amount >= 0),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column received_on date not null,
  add constraint finance_dividends_account_fk foreign key (owner_id, investment_account_id) references finance.investment_accounts (owner_id, id);
create index finance_dividends_owner_date_idx on finance.dividends (owner_id, received_on desc, id);

alter table finance.market_prices
  add column symbol text not null,
  add column price numeric(38, 18) not null check (price >= 0),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column observed_at timestamptz not null,
  add column source text,
  add constraint finance_market_price_owner_symbol_time_uq unique (owner_id, symbol, observed_at);
create index finance_market_prices_owner_time_idx on finance.market_prices (owner_id, observed_at desc, id);

alter table finance.loans
  add column name text not null,
  add column principal numeric(38, 18) not null check (principal > 0),
  add column outstanding_balance numeric(38, 18) not null check (outstanding_balance >= 0),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column started_on date not null,
  add column ends_on date not null,
  add column status text not null default 'active' check (status in ('active', 'paused', 'closed')),
  add constraint finance_loans_balance_bound check (outstanding_balance <= principal),
  add constraint finance_loans_date_order check (started_on <= ends_on);

alter table finance.loan_payments
  add column loan_id uuid not null,
  add column amount numeric(38, 18) not null check (amount > 0),
  add column principal_component numeric(38, 18),
  add column interest_component numeric(38, 18),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column paid_on date not null,
  add constraint finance_loan_payments_loan_fk foreign key (owner_id, loan_id) references finance.loans (owner_id, id),
  add constraint finance_loan_payment_components_nonnegative check ((principal_component is null or principal_component >= 0) and (interest_component is null or interest_component >= 0));
create index finance_loan_payments_owner_date_idx on finance.loan_payments (owner_id, paid_on desc, id);

alter table finance.tax_profiles
  add column jurisdiction text not null,
  add column financial_year text not null,
  add column rule_version text not null,
  add column rule_effective_on date not null,
  add column status text not null default 'active' check (status in ('active', 'archived')),
  add constraint finance_tax_profiles_owner_year_uq unique (owner_id, jurisdiction, financial_year, rule_version);

alter table finance.tax_records
  add column tax_profile_id uuid,
  add column record_type text not null,
  add column amount numeric(38, 18) not null,
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column occurred_on date not null,
  add constraint finance_tax_records_profile_fk foreign key (owner_id, tax_profile_id) references finance.tax_profiles (owner_id, id);
create index finance_tax_records_owner_date_idx on finance.tax_records (owner_id, occurred_on desc, id);

alter table finance.insurance_policies
  add column name text not null,
  add column policy_type text not null,
  add column premium_amount numeric(38, 18),
  add column coverage_amount numeric(38, 18),
  add column currency char(3) check (currency is null or currency ~ '^[A-Z]{3}$'),
  add column starts_on date,
  add column ends_on date,
  add column status text not null default 'active' check (status in ('active', 'paused', 'expired', 'archived')),
  add constraint finance_insurance_amounts_nonnegative check ((premium_amount is null or premium_amount >= 0) and (coverage_amount is null or coverage_amount >= 0)),
  add constraint finance_insurance_date_order check (starts_on is null or ends_on is null or starts_on <= ends_on);

alter table finance.financial_goals
  add column name text not null,
  add column target_amount numeric(38, 18) not null check (target_amount > 0),
  add column recorded_progress_amount numeric(38, 18) not null default 0 check (recorded_progress_amount >= 0),
  add column currency char(3) not null check (currency ~ '^[A-Z]{3}$'),
  add column target_date date not null,
  add column status text not null default 'active' check (status in ('draft', 'active', 'paused', 'completed', 'archived'));
create index finance_goals_owner_date_idx on finance.financial_goals (owner_id, target_date, id);

alter table finance.financial_imports
  add column source_type text not null,
  add column source_name text not null,
  add column imported_at timestamptz not null,
  add column status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'archived')),
  add column content_checksum text;
create index finance_imports_owner_time_idx on finance.financial_imports (owner_id, imported_at desc, id);

alter table finance.financial_import_rows
  add column financial_import_id uuid not null,
  add column row_number integer not null check (row_number > 0),
  add column status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  add column normalized_data jsonb not null default '{}'::jsonb check (jsonb_typeof(normalized_data) = 'object'),
  add constraint finance_import_rows_import_fk foreign key (owner_id, financial_import_id) references finance.financial_imports (owner_id, id),
  add constraint finance_import_rows_owner_row_uq unique (owner_id, financial_import_id, row_number);

alter table finance.financial_documents
  add column title text not null,
  add column document_type text not null,
  add column storage_key text not null,
  add column recorded_on date,
  add column content_checksum text;
create unique index finance_documents_owner_storage_uq on finance.financial_documents (owner_id, storage_key) where deleted_at is null;

alter table finance.calculator_scenarios
  add column calculator_id text not null,
  add column calculator_version text not null,
  add column name text not null,
  add column input jsonb not null check (jsonb_typeof(input) = 'object');
create unique index finance_scenarios_owner_name_uq on finance.calculator_scenarios (owner_id, calculator_id, lower(name)) where deleted_at is null;
create index finance_scenarios_owner_calculator_idx on finance.calculator_scenarios (owner_id, calculator_id, updated_at desc, id);

insert into platform.migration_audit (version, scope, name)
values ('20260921003000', 'finance', 'finance');

commit;
