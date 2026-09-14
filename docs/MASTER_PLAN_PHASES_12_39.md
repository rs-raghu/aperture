# Aperture v2 — Continuous Implementation Mission, Phases 12–39

You are the primary implementation agent responsible for completing Aperture v2 from **Phase 12 through Phase 39** in one continuous task.

Do not stop after completing a phase to request another prompt. Continue automatically through the remaining phases unless you encounter a genuine blocker requiring user authority, credentials, a destructive production action, or an unresolved conflict with user-owned changes.

---

# 1. Project context

- Project: `D:\Hello World\Automations\Personal Dashboard\aperture v2`
- Expected branch: `codex/aperture-v2`
- Phase 10 commit: `f5190180f3d6b486e3404036aa71fbd29f617098`
- Phase 10 is pushed.
- Phase 11 should be complete before Phase 12 begins.
- Architecture: modular TypeScript monorepo with Education, Health, Finance, web, mobile, validation, repository, infrastructure, and future integration boundaries.
- Web: Next.js App Router, React, and TypeScript.
- Mobile: Expo, Expo Router, React Native, and TypeScript.
- Planned durable storage: PostgreSQL through Supabase.
- Optional server functionality may use FastAPI only where it adds value.
- Intended deployment: Vercel for the web application, Supabase for shared durable data, and Expo/EAS-ready mobile applications.
- This is a private, single-owner personal application—not a public SaaS product.

The project must remain highly modular and open for extension. Core application code must not require modification whenever a feature, widget, calculator, repository adapter, integration, route contribution, or migration is added.

---

# 2. Mission outcome

Complete the remaining Health, Finance, platform, persistence, synchronization, dashboard, backup, integration, portfolio, quality, and deployment-readiness work.

At the end:

- Education, Health, and Finance must have complete vertical slices.
- Web and mobile must use shared domain and application logic.
- Web and mobile must read and write the same durable personal data.
- Calculator Hub must include every required calculator.
- Feature and calculator registration must be modular.
- Personal authentication and database security must protect the hosted application.
- Export, import, backup, and restoration must exist.
- Optional Strava integration must be isolated.
- A professional portfolio feature must exist without exposing private dashboard data.
- Tests, lint, type-checks, builds, migrations, security checks, and documentation must pass.
- The project must be deployable without architectural reconstruction.

Do not claim completion for functionality that was not tested.

---

# 3. Continuous execution and context preservation

Create these files before Phase 12 implementation begins:

```text
docs/MASTER_PLAN_PHASES_12_39.md
docs/EXECUTION_LEDGER.md
```

`MASTER_PLAN_PHASES_12_39.md` must preserve the approved scope of every phase in this prompt.

`EXECUTION_LEDGER.md` must contain:

- Current phase
- Current phase status
- Starting commit
- Ending commit
- Files changed
- Dependencies added
- Database migrations added
- Tests added
- Focused verification result
- Full regression result
- Audit result
- Known limitations
- Deferred work
- Next phase
- Last successfully completed command
- Any unresolved concern

Update the ledger during each phase—not only at the end.

If context is compacted, interrupted, or resumed:

1. Read `docs/MASTER_PLAN_PHASES_12_39.md`.
2. Read `docs/EXECUTION_LEDGER.md`.
3. Inspect `git status`.
4. Inspect recent commits.
5. Resume from the first incomplete acceptance item.
6. Do not redo completed phases.
7. Do not skip verification because an earlier conversation is unavailable.

Do not return a final answer until all technically executable phases are complete or a genuine external blocker prevents further progress.

Provide concise progress updates while working, but continue without waiting for confirmation after successful internal checkpoints.

---

# 4. Git and safety protocol

Before starting:

```powershell
git status --short
git status -sb
git log -10 --oneline
git fetch
git log --oneline '@{u}..HEAD'
git log --oneline 'HEAD..@{u}'
```

Requirements:

- Confirm the repository and branch.
- Preserve all user-owned changes.
- Never run `git reset --hard`.
- Never discard files with `git checkout --`.
- Never force-push.
- Never amend completed phase commits.
- Never rebase published history without explicit permission.
- Never commit credentials, tokens, `.env` files, personal records, database dumps, or production backups.
- Use one separate commit for every numbered phase.
- Keep the working tree clean between phases.
- Push each completed two-phase pair to the existing upstream branch.
- If pushing fails because authentication or connectivity is unavailable, continue locally and record the unpushed commits.
- Stop if remote history unexpectedly diverges.
- Do not create releases or tags unless required during final release preparation.

Use these commit messages unless the repository’s established convention requires a small adjustment:

```text
feat(health): implement phase 12 calculations
feat(health): implement phase 13 services
feat(health): implement phase 14 memory repositories
feat(health): implement phase 15 web feature
feat(health): implement phase 16 mobile feature
test(health): complete phase 17 integration hardening

feat(finance): implement phase 18 models and validation
feat(finance): implement phase 19 calculation foundation
feat(finance): implement phase 20 investment calculators
feat(finance): implement phase 21 loan and taxation calculators
feat(finance): implement phase 22 retirement calculators
feat(finance): implement phase 23 services
feat(finance): implement phase 24 memory repositories
feat(finance): implement phase 25 web feature
feat(finance): implement phase 26 mobile feature
test(finance): complete phase 27 integration hardening

feat(data): implement phase 28 database schema and migrations
feat(data): implement phase 29 durable repositories
feat(auth): implement phase 30 personal access control
feat(sync): implement phase 31 shared data synchronization
feat(platform): implement phase 32 modular dashboard shell
feat(planner): implement phase 33 today and planner features
feat(settings): implement phase 34 settings and privacy controls
feat(backup): implement phase 35 export and restoration
feat(strava): implement phase 36 optional integration
feat(portfolio): implement phase 37 professional portfolio
test(platform): complete phase 38 release hardening
chore(release): complete phase 39 deployment readiness
```

---

# 5. Phase gate protocol

For every phase:

## Before implementation

1. Read the phase scope and ledger.
2. Confirm the previous phase is committed.
3. Confirm the working tree is clean.
4. Run focused baseline checks.
5. Inventory the declarations and existing code relevant to the phase.
6. Identify required dependencies.
7. Reuse installed packages where practical.
8. Install only necessary dependencies in the correct workspace.
9. Review all lockfile changes.

## During implementation

1. Work in small vertical slices.
2. Keep domain, application, infrastructure, and presentation boundaries separate.
3. Add tests alongside implementation.
4. Use public package entry points.
5. Avoid central handwritten registries.
6. Avoid unrelated refactors.
7. Update documentation and the execution ledger.
8. Preserve platform-neutral shared code.

## After implementation

1. Run focused tests.
2. Run relevant lint, type-check, and builds.
3. Inspect the diff.
4. Scan for secrets and personal data.
5. Commit the phase.
6. Ensure the tree is clean.
7. Begin the next phase only when the current phase passes.

## After each two-phase pair

Run:

- Full workspace tests
- Full workspace type-check
- Full lint
- Relevant package builds
- Next.js production build
- Expo diagnostics and export checks
- Dependency audit
- Git status and upstream comparison

Push both phase commits together after the pair passes.

If the second phase fails, do not rewrite the first phase’s commit.

---

# 6. Global engineering rules

## Modularity

Every feature must own its:

- Manifest
- Routes or route metadata
- Navigation contribution
- Widgets
- Permissions
- State namespace
- Repository interfaces
- Repository adapters
- Database migrations
- API contribution where applicable
- Tests
- Documentation

Every calculator must own its:

- Identifier
- Manifest
- Category
- Input schema
- Output schema
- Calculation function
- Assumption metadata
- Examples
- Tests
- Web presentation contribution
- Mobile presentation contribution

Do not add central switch statements such as:

```ts
switch (calculatorId) {
  // every calculator
}
```

Do not maintain manually synchronized lists across web, mobile, API, navigation, and tests.

Use build-time discovery or validated code generation where runtime discovery is incompatible with Next.js or Expo bundling.

Generated imports must remain literal so bundlers can statically analyze them.

## Dependency direction

```text
Presentation
    ↓
Application services
    ↓
Repository interfaces
    ↓
Infrastructure adapters
    ↓
External systems
```

Domain packages must not import:

- React
- React Native
- Next.js
- Expo
- Supabase
- Database clients
- Browser APIs
- Node-specific APIs
- Integration SDKs

## Quality

Do not use:

- `any`
- Broad unsafe assertions
- `@ts-ignore`
- Empty implementations
- Fabricated return values
- Silent error swallowing
- Disabled tests
- Forced dependency upgrades
- Duplicated business formulas in UI code

All time-dependent business behavior must use injected clocks.

All identifier creation must use injected generators.

Money must use decimal-safe arithmetic. Never use ordinary binary floating-point math for financial results.

---

# 7. Phase 11 prerequisite gate

Before Phase 12:

- Verify Phase 11 Health models and validation are complete.
- Verify every required Health runtime schema is exported.
- Verify Phase 11 is committed.
- Run its tests and build.
- Verify Phase 11 did not implement calculations, services, repositories, or UI prematurely.

If Phase 11 contains a small acceptance gap, repair only that gap, test it, and commit:

```text
fix(health): complete phase 11 prerequisites
```

Do not redesign Phase 11 unnecessarily.

---

# 8. Phases 12–13: Health calculations and services

## Phase 12 — Health calculations

Implement the exact Health calculation declarations established by Phase 2.

First inventory all declared calculation contracts. Do not substitute a guessed list for the declarations.

Expected areas may include:

- Unit conversions
- BMI or declared body-measurement calculations
- Distance, duration, pace, and speed
- Heart-rate zones
- Blood-pressure summaries where declared
- Workout volume and load
- Hydration totals
- Nutrition totals
- Sleep duration and consistency
- Running summaries
- Trend or percentage calculations
- Heart-rate variability summaries

Only implement calculations represented by approved contracts. Document useful missing calculations as future extensions instead of silently changing the contract.

Requirements:

- Pure deterministic functions
- No current time
- No random values
- No database access
- No UI formatting
- Explicit units
- Finite-number validation
- Deterministic rounding policy
- No diagnostic interpretation
- No medical recommendations
- No classification such as “healthy,” “dangerous,” or “normal” unless an explicitly configurable non-clinical display contract already exists

Test:

- Every calculation
- Unit combinations
- Zero and boundary values
- Invalid values
- `NaN` and infinities
- Rounding
- Reversibility where appropriate
- Equivalent-unit cases
- Date/duration boundaries
- Property-style invariants where practical

Document formulas, units, rounding, assumptions, and medical-safety boundaries.

Commit Phase 12 before Phase 13.

## Phase 13 — Health services

Implement the declared Health application services and lifecycle operations.

Cover all applicable entities and workflows, such as:

- Health profile
- Body measurements
- Vital signs
- Exercises
- Workouts
- Workout sets
- Running activities
- Sleep records
- Nutrition
- Meals
- Hydration
- Goals
- Progress records
- Other Phase 2 entities

Requirements:

- Use repository interfaces only.
- Inject clock and ID generation.
- Enforce owner scoping.
- Enforce relationship ownership.
- Validate inputs through Health runtime schemas.
- Use Phase 12 calculations.
- Preserve unusual but structurally valid measurements.
- Keep diagnostic logic out of services.
- Implement lifecycle transitions explicitly.
- Return structured application errors.
- Never expose repository internals.

Use deterministic test doubles—not production memory repositories—for focused service tests.

Test:

- Every public service method
- Successful workflows
- Missing parent records
- Cross-owner access
- Invalid lifecycle transitions
- Duplicate IDs
- Validation propagation
- Injected time and identifiers
- Calculation orchestration
- Repository failure propagation
- No partial mutation on rejected operations

Run the full pair gate and push Phases 12–13.

---

# 9. Phases 14–15: Health repositories and web

## Phase 14 — Health memory repositories

Create a dedicated package following the Education Memory pattern, such as:

```text
@aperture/health-memory
```

Implement every Health repository interface.

Requirements:

- Isolated state per factory
- No process-wide singleton
- Owner-scoped operations
- Global ID uniqueness within each aggregate
- Defensive copying
- Deterministic ordering
- Stable ID tie-breakers
- AND-based filters
- Inclusive date boundaries where declared
- Validated pagination cursors
- Explicit deletion behavior
- No persistence
- No sample personal data

Create deterministic test-only fixture builders.

Build reusable repository contract tests that can later run against Supabase adapters.

Test every repository method, filter, pagination path, ownership condition, mutation, deletion, and defensive-copy guarantee.

Commit Phase 14 before Phase 15.

## Phase 15 — Health web feature

Implement an Education-style Health web preview with thin App Router route files and an isolated feature package/boundary.

Minimum routes, adapted to the actual contracts:

```text
/health
/health/profile
/health/measurements
/health/vitals
/health/workouts
/health/running
/health/sleep
/health/nutrition
/health/hydration
/health/goals
```

Use one Health runtime provider per mounted Health feature. It must remain stable during Health route navigation and reset on full refresh.

Use an explicit synthetic development owner. Clearly state that it is not authentication.

Required UX:

- Overview summaries
- Empty states
- Record creation
- Supported editing/deletion
- Workout lifecycle
- Exercise and set management
- Running activity management
- Sleep recording
- Nutrition and hydration records
- Goal tracking
- Filters
- Accessible forms
- Responsive layout
- Human-readable errors
- No raw validation objects
- No `[object Object]`
- No diagnosis or medical recommendations

Use simple CSS visualization where useful. Do not add a charting dependency unless a chart materially improves comprehension and the dependency is justified.

Tests must use real Health services and memory repositories for primary workflows.

Run the full pair gate and push Phases 14–15.

---

# 10. Phases 16–17: Health mobile and hardening

## Phase 16 — Health mobile feature

Implement the matching Education-style Expo/React Native Health preview.

Requirements:

- Thin Expo Router routes
- Shared Health provider above all Health routes
- Stable repository/service lifetime
- Expo-compatible IDs and clocks
- No browser-only APIs
- Safe-area handling
- Keyboard-aware forms
- Virtualized lists
- Mobile-accessible controls
- Long-text handling
- Clear status text
- No color-only communication
- Real services and memory repositories
- Same business behavior as web
- No copied business formulas

Test:

- Provider stability
- Navigation persistence
- Owner isolation
- Forms
- Validation
- Workflows
- Error normalization
- Expo compatibility
- Public imports

Run Expo Doctor and Android/iOS/web export checks. Test a native Android runtime if available. Never claim native testing when only export checks were performed.

Commit Phase 16 before Phase 17.

## Phase 17 — Health integration hardening

Audit the complete Health vertical slice.

Verify:

- Domain and validation completeness
- All calculations
- All service operations
- Repository contract compliance
- Web/mobile behavioral parity
- Units and precision
- Timezone handling
- Ownership isolation
- Error consistency
- Accessibility
- Responsive behavior
- Expo compatibility
- Medical-safety language
- No accidental clinical claims
- No persistence or integration leakage into domain code

Add missing contract, integration, accessibility, and regression tests.

Create:

```text
docs/HEALTH_VERTICAL_SLICE.md
```

The document must describe architecture, features, tests, limitations, safety boundaries, and future durable-storage behavior.

Run the full pair gate and push Phases 16–17.

---

# 11. Phases 18–19: Finance models and calculation foundation

## Phase 18 — Finance models and validation

Convert the complete Phase 3 Finance declaration surface into runtime models and validation.

Inventory every declared entity, identifier, enum, input, query, calculator input, calculator output, and repository contract.

Expected domains may include:

- Accounts
- Transactions
- Categories
- Income
- Expenses
- Budgets
- Assets
- Liabilities
- Investments
- Holdings
- Contributions
- Loans
- Repayments
- Tax profiles
- Retirement assumptions
- Calculator scenarios
- Saved calculations
- Financial goals

Requirements:

- Decimal-string boundary representation
- Explicit currency
- Explicit interest-rate convention
- Explicit compounding frequency
- Explicit contribution timing
- ISO dates and timestamps
- Fiscal-year identifiers
- Versioned calculation assumptions
- Owner scoping
- No bank credentials
- No PINs, OTPs, passwords, or raw third-party login credentials
- No floating-point monetary models

Use the existing validation package. Install no second validation framework.

Test every schema and meaningful boundary.

Commit Phase 18 before Phase 19.

## Phase 19 — Finance calculation foundation

Implement reusable decimal-safe financial primitives.

Required foundation:

- Simple interest
- Compound interest
- Periodic-rate conversion
- Nominal/effective-rate handling
- Present value
- Future value
- Annuity calculations
- Cash-flow timeline representation
- ROI
- CAGR
- XIRR
- Inflation-adjusted prices
- Amortization primitives
- Contribution timing
- Withdrawal timing
- Rounding and currency display boundaries

Requirements:

- Use `decimal.js` or the established decimal-safe library.
- Return decimal strings at public serialization boundaries.
- Document all formulas.
- Define cash-flow sign conventions.
- Define day-count assumptions.
- Make frequencies explicit.
- Never silently convert annual rates.
- Reject impossible or non-convergent cases safely.
- XIRR must use a bounded iterative method with deterministic failure behavior.
- Do not mix UI formatting into calculations.

Each calculator module must begin following the plug-in structure:

```text
calculator/
├── manifest
├── input schema
├── output schema
├── calculate
├── examples
└── tests
```

Run the full pair gate and push Phases 18–19.

---

# 12. Phases 20–21: Investment, loan, income, and tax calculators

## Phase 20 — Investment and wealth calculators

Implement independent calculator modules for:

- SIP
- Step Up SIP
- Lumpsum
- SWP
- Mutual Funds
- SSY
- PPF
- FD
- RD
- NSC
- Post Office MIS
- SCSS
- Stock Average
- Brokerage
- Margin
- ROI
- CAGR
- XIRR

Where ROI, CAGR, and XIRR were implemented in Phase 19, Phase 20 should provide their complete calculator manifests, schemas, examples, and registry contributions without duplicating formulas.

Requirements:

- Each calculator is independently testable.
- No central calculator switch statement.
- Rates and limits are explicit inputs.
- Government-scheme presets are versioned and effective-dated.
- Do not silently present old rates as current.
- Clearly separate contributions, principal, gains, withdrawals, tax assumptions, and maturity values.
- Document beginning-versus-end contribution timing.
- Use reference examples and boundary tests.

For Indian government schemes, use official primary sources when creating presets. Record source URL, retrieval date, effective date, and assumption version. If current official values cannot be verified, require user-supplied values rather than inventing defaults.

Commit Phase 20 before Phase 21.

## Phase 21 — Loans, income, taxation, and economic calculators

Implement independent modules for:

- Generic EMI
- Home Loan EMI
- Car Loan EMI
- Simple Interest
- Compound Interest
- Flat versus Reducing Rate EMI
- Salary and Net Take-home
- Income Tax
- TDS
- HRA
- GST
- Inflation-adjusted Prices

Requirements:

- Amortization schedules must reconcile.
- Final-payment rounding must be handled.
- Flat and reducing-rate comparisons must disclose assumptions.
- Salary components must remain explicit.
- Tax regimes must be versioned by financial year.
- Tax slabs, deductions, rebates, cess, and surcharge assumptions must not be timeless hard-coded constants.
- TDS must be described as withholding, not final tax liability.
- GST must support inclusive and exclusive calculations.
- HRA inputs and assumptions must be transparent.
- Results must include disclaimers and calculation explanations.

Use official Indian government sources for presets. Prefer Income Tax Department, GST Council/CBIC, EPFO, PFRDA, India Post, and other authoritative government sources.

Do not provide personalized financial advice.

Run the full pair gate and push Phases 20–21.

---

# 13. Phases 22–23: Retirement calculators and Finance services

## Phase 22 — Retirement and independence calculators

Implement independent modules for:

- FIRE
- Retirement Corpus
- NPS
- Gratuity
- EPF
- APY

Requirements:

- Inflation-adjusted expenses
- Pre-retirement and post-retirement return assumptions
- Contribution schedules
- Retirement age and horizon
- Withdrawal-rate assumptions
- Longevity horizon
- Existing corpus
- Employer/employee contributions where applicable
- Versioned government rules
- Transparent outputs
- Scenario comparisons
- No promises or guarantees
- No personalized investment recommendation

Each result must expose assumptions and uncertainty clearly.

Use official sources for government-scheme presets. If official current values cannot be confirmed, keep formulas configurable and omit the preset.

Commit Phase 22 before Phase 23.

## Phase 23 — Finance services

Implement Finance application services and use cases.

Cover:

- Accounts
- Transactions
- Categories
- Income and expenses
- Budgets
- Assets and liabilities
- Investments
- Loans
- Financial goals
- Saved calculator scenarios
- Calculator execution
- Calculator search/category metadata
- Favorites and recent calculators where declared

Requirements:

- Repository interfaces only
- Owner isolation
- Decimal-safe values
- Injected clock and IDs
- Explicit currencies
- Relationship validation
- Duplicate prevention
- Structured errors
- Calculator registry dependency
- No UI imports
- No database imports
- No financial advice

Test every public method and failure path using deterministic test doubles.

Run the full pair gate and push Phases 22–23.

---

# 14. Phases 24–25: Finance repositories and web

## Phase 24 — Finance memory repositories

Create a package such as:

```text
@aperture/finance-memory
```

Implement all Finance repository interfaces.

Requirements:

- Per-factory isolation
- Owner scoping
- Decimal-string preservation
- Defensive cloning
- Deterministic ordering
- Stable pagination
- Date and category filtering
- Account and currency filtering
- Transaction ordering
- No implicit currency conversion
- No process-global mutable data

Create reusable repository contract tests and deterministic fixtures.

Commit Phase 24 before Phase 25.

## Phase 25 — Finance web and Calculator Hub

Implement Finance web routes, adapted to actual contracts:

```text
/finance
/finance/accounts
/finance/transactions
/finance/budgets
/finance/assets
/finance/liabilities
/finance/investments
/finance/loans
/finance/goals
/calculators
/calculators/[calculator-id]
```

Calculator Hub categories:

- Academic
- Core Interest and Returns
- Investment and Wealth
- Loans and EMI
- Income and Salary
- Taxation
- Retirement and Independence
- Government Savings Schemes
- Economic and Inflation

Include GPA and CGPA by adapting the existing Education calculations. Do not duplicate their formulas inside Finance.

Required Calculator Hub UX:

- Search
- Categories
- Favorites
- Recently used calculators
- Individual calculator routes
- Input explanation
- Result summary
- Assumption disclosure
- Calculation breakdown
- Reset
- Save scenario
- Compare scenarios where supported
- Responsive mobile-width layout
- Accessible errors
- Decimal-safe display

Finance forms must never request bank passwords, PINs, OTPs, or raw banking credentials.

Run the full pair gate and push Phases 24–25.

---

# 15. Phases 26–27: Finance mobile and hardening

## Phase 26 — Finance mobile

Implement Finance and Calculator Hub screens in Expo/React Native.

Requirements:

- Shared services and calculations
- Stable mobile provider
- Mobile-safe decimal handling
- Secure input practices
- Appropriate numeric keyboards
- Long-result handling
- Accessible tables or card alternatives
- Calculator search and categories
- Scenario saving
- No web component imports
- No formula duplication
- Expo-compatible workspace imports

Run mobile component tests, Expo Doctor, and platform export checks.

Commit Phase 26 before Phase 27.

## Phase 27 — Finance integration hardening

Audit:

- Every required calculator
- Formula correctness
- Reference examples
- Decimal precision
- Rounding
- Sign conventions
- Rate conversions
- Government preset versions
- Tax-year metadata
- Web/mobile parity
- Repository behavior
- Ownership
- Accessibility
- Error behavior
- Disclaimers
- No accidental advice

Create:

```text
docs/FINANCE_VERTICAL_SLICE.md
docs/CALCULATOR_REFERENCE.md
```

`CALCULATOR_REFERENCE.md` must list every calculator, formula, assumptions, input units, output fields, preset version, and test references.

Run the full pair gate and push Phases 26–27.

---

# 16. Phases 28–29: Durable data

## Phase 28 — PostgreSQL/Supabase schema and migrations

Design durable storage for Education, Health, Finance, Planner, settings, calculator scenarios, sync metadata, and integrations.

Requirements:

- PostgreSQL migrations
- UUID primary keys
- `owner_id`
- UTC timestamps
- Appropriate date-only columns
- `NUMERIC` for money and precision-sensitive values
- Currency codes
- Foreign keys
- Unique constraints
- Check constraints
- Indexes for owner and date queries
- Soft-delete/version fields where synchronization requires them
- Row Level Security
- Migration ordering
- Roll-forward safety
- Synthetic development seed only
- No personal seed data

Plugin-owned migrations must be discoverable without editing a central migration list.

Add schema and migration tests. Test migrations from an empty database and from the previous migration state.

Do not run destructive migrations against an existing remote database without verifying the target and obtaining explicit authorization.

Commit Phase 28 before Phase 29.

## Phase 29 — Durable repository adapters

Implement Supabase/PostgreSQL repository adapters for all existing repository contracts.

Requirements:

- Education contract suite passes
- Health contract suite passes
- Finance contract suite passes
- Owner isolation
- Transactional multi-record operations
- Decimal fidelity
- Pagination consistency
- Date filtering consistency
- Defensive mapping
- Structured database errors
- No database types leaking into domain packages
- No service rewrites

Use local Supabase or an isolated test database for integration tests.

Memory and durable adapters must be interchangeable through composition configuration.

Run the full pair gate and push Phases 28–29.

---

# 17. Phases 30–31: Personal access and synchronization

## Phase 30 — Personal authentication and security

Implement the minimum secure access boundary appropriate for a private personal application.

Preferred model:

- Supabase Auth
- One allowlisted owner account
- Public self-registration disabled
- Secure web session handling
- Expo-compatible PKCE/deep-link session handling
- Secure mobile token storage
- RLS based on authenticated user ID
- Development bypass allowed only in explicit local development mode
- No development bypass in production builds

Do not build enterprise organization, team, invitation, billing, or role-management features.

Test:

- Allowed owner access
- Rejected unknown account
- Unauthenticated access
- Cross-owner denial
- Session refresh
- Logout
- Expired session
- Production bypass disabled
- RLS policies

Commit Phase 30 before Phase 31.

## Phase 31 — Shared web/mobile data and synchronization

Replace preview-only composition with configurable durable composition.

Requirements:

- Web and mobile use the same Supabase-backed data.
- Memory mode remains available for tests and explicit previews.
- Repository selection is performed in composition roots.
- Feature code does not know which adapter is active.
- Writes are idempotent.
- Sync state is observable.
- Retry behavior is bounded.
- Duplicate writes are prevented.
- Offline behavior is documented accurately.
- Network failures do not fabricate success.

If the architecture claims true local-first behavior, implement the required local operation log and synchronization semantics. Otherwise, update documentation to describe the application honestly as cloud-synchronized with local caching.

If implementing offline writes:

- Use IndexedDB on web.
- Use Expo SQLite or the established local mobile store.
- Maintain an outbox with idempotency keys.
- Track record versions and tombstones.
- Define deterministic conflict behavior.
- Preserve conflicts for inspection when data loss is possible.
- Test offline create/update/delete and reconnection.

Server boundary:

- Do not create duplicate CRUD layers.
- Use Supabase directly through repository adapters for ordinary personal data.
- Use FastAPI only for functionality requiring server-held secrets, webhooks, or background orchestration.
- If FastAPI is retained, feature routers must be discovered through Python package entry points rather than a handwritten central list.

Run the full pair gate and push Phases 30–31.

---

# 18. Phases 32–33: Modular shell, Today, and Planner

## Phase 32 — Modular dashboard shell

Build the complete web and mobile shell.

Implement:

- Responsive navigation
- Mobile navigation
- Feature manifests
- Widget manifests
- Calculator manifests
- Permission metadata
- Route metadata
- Enable/disable state
- Search
- Command palette where appropriate
- Error boundaries
- Loading boundaries
- Not-found states
- Theme foundation

The core shell must not import every feature through a handwritten list.

Use validated build-time generation to discover:

- Feature manifests
- Literal frontend imports
- Navigation contributions
- Widget contributions
- Calculator modules
- Backend entry points
- Plugin migrations

Add commands such as:

```text
validate:plugins
generate:plugins
generate:calculators
plugin:create
```

Adding a future feature should primarily involve creating a feature package and manifest, then running generation. Core navigation and state must not require manual edits.

Add registry validation and duplicate-ID tests.

Commit Phase 32 before Phase 33.

## Phase 33 — Today and Planner

Implement complete Today and Planner vertical slices.

Planner should cover the existing declarations and intended scope, such as:

- Tasks
- Events
- Deadlines
- Priorities
- Status
- Recurrence where declared
- Daily planning
- Weekly planning
- Completion
- Filtering
- Overdue handling

Today must aggregate contributions without directly importing feature internals:

- Education deadlines
- Planned study
- Health/workout plans
- Finance reminders
- Planner tasks
- Configurable widgets
- Quick actions

Feature packages must contribute Today widgets through manifests.

Implement web and mobile views, services, repositories, durable adapters, tests, and documentation.

Run the full pair gate and push Phases 32–33.

---

# 19. Phases 34–35: Settings, privacy, export, and backup

## Phase 34 — Settings and privacy

Implement shared settings for:

- Theme
- Locale
- Timezone
- Currency
- Date format
- Unit preferences
- Week-start day
- Fiscal-year preference
- Calculator defaults
- Feature enable/disable state
- Dashboard widget preferences
- Privacy controls
- Integration status

Requirements:

- Owner scoped
- Synced across devices where appropriate
- Platform-specific settings isolated
- Safe defaults
- No secret values returned to clients
- Feature disabling must not delete data
- Core security modules cannot be disabled

Implement web and mobile settings interfaces.

Commit Phase 34 before Phase 35.

## Phase 35 — Export, import, backup, and restoration

Implement:

- Versioned full-data export
- Feature-scoped export
- Import validation
- Dry-run import
- Conflict reporting
- Transactional restore
- Backup metadata
- Schema-version compatibility
- Data deletion workflow
- Recovery documentation

Requirements:

- Exports never include authentication tokens or third-party secrets.
- Money remains exact.
- Timestamps and units remain explicit.
- Restore validates before mutation.
- Failed restore must not leave partial state.
- Unknown future fields are handled safely.
- Destructive replacement requires explicit confirmation.
- Add synthetic round-trip tests.
- Add corrupted-backup tests.
- Add old-version migration tests.

Optional encrypted exports are permitted only with a reviewed implementation. Plaintext exports must include a privacy warning.

Run the full pair gate and push Phases 34–35.

---

# 20. Phases 36–37: Strava and portfolio

## Phase 36 — Optional Strava integration

Implement Strava as an optional plug-in.

Requirements:

- Minimal OAuth scopes
- PKCE/state protection as applicable
- Server-held client secret
- Encrypted refresh-token storage
- Token refresh
- Disconnect and deletion
- Idempotent activity import
- Webhook verification
- Duplicate prevention
- Rate-limit handling
- Sync status
- Last-success and last-error metadata
- Manual sync
- Mock development mode
- No credentials in clients or logs

Map imported activities through an adapter into Health service inputs. Do not bypass Health validation or repositories.

The rest of Aperture must work when Strava is disabled or unconfigured.

Commit Phase 36 before Phase 37.

## Phase 37 — Professional portfolio

Implement the professional portfolio as a separate feature.

Requirements:

- Profile
- Biography
- Skills
- Projects
- Experience
- Education highlights
- Certifications
- Contact links
- Resume link or export where supported
- Responsive public presentation
- Private editing interface
- SEO metadata
- Accessible structure

Privacy requirements:

- Private by default
- Explicit configuration required to publish
- Never expose Health or Finance data
- Do not automatically publish academic records
- Only explicitly curated Education achievements may appear
- No owner email exposure unless intentionally configured
- Contact form, if added, must include abuse protection

The portfolio must register through the feature system.

Run the full pair gate and push Phases 36–37.

---

# 21. Phase 38 — Release hardening

Perform a complete application audit.

## Automated testing

Add and run:

- Domain unit tests
- Validation tests
- Calculation reference tests
- Service tests
- Repository contract tests
- Supabase integration tests
- Migration tests
- RLS tests
- Sync tests
- Web component tests
- Mobile component tests
- Web end-to-end tests
- Backup/restore tests
- Plugin registry tests
- Calculator registry tests
- Authentication tests
- Strava mock/integration-contract tests
- Public portfolio tests

Critical web E2E workflows:

1. Authenticate as the owner.
2. Create and view Education data.
3. Record Health data.
4. Create Finance data.
5. Run and save calculators.
6. Confirm Today aggregation.
7. Create Planner tasks.
8. Change settings.
9. Export data.
10. Validate and restore a backup.
11. Log out and confirm private-route protection.

## Security review

Check:

- RLS
- Owner isolation
- Secret handling
- Logs
- OAuth state
- Token storage
- XSS
- CSRF where applicable
- Redirect validation
- Import safety
- Rate limiting
- Dependency vulnerabilities
- Production development bypasses
- Private route caching
- Portfolio privacy boundary

## Quality review

Check:

- Accessibility
- Keyboard navigation
- Screen-reader labels
- Color contrast
- Responsive layout
- Mobile safe areas
- Empty states
- Error states
- Loading states
- Hydration
- Console warnings
- Metro warnings
- Performance
- Bundle size
- Database indexes
- Query counts
- Pagination
- Timezone behavior
- Currency precision
- Backup recovery

Create:

```text
docs/RELEASE_READINESS.md
docs/SECURITY_REVIEW.md
docs/TEST_MATRIX.md
```

Commit Phase 38 only after all internal release gates pass.

---

# 22. Phase 39 — Deployment readiness and permitted deployment

Prepare:

- Production `.env.example`
- Environment-variable documentation
- Vercel configuration
- Supabase migration commands
- Supabase redirect URLs
- Mobile deep-link configuration
- EAS configuration
- PWA manifest and icons where appropriate
- Health checks
- Structured logging
- Error monitoring hooks without transmitting sensitive personal payloads
- Backup instructions
- Rollback instructions
- Disaster-recovery instructions
- Deployment checklist
- Post-deployment smoke-test checklist

Preferred deployment structure:

- Next.js web application on Vercel
- PostgreSQL, Auth, and storage through Supabase
- Expo/EAS-ready mobile builds
- FastAPI hosted separately only if retained for secret-bearing integrations or webhooks

Do not create duplicate production APIs.

## Deployment authorization boundary

This prompt authorizes:

- Code changes
- Local migrations
- Isolated test databases
- Local builds
- Commits
- Normal pushes to the existing feature branch
- Deployment configuration
- Deployment documentation

It does not authorize:

- Purchasing paid services
- Force-pushing
- Deleting remote data
- Dropping production tables
- Publishing to an app store
- Making the portfolio public without explicit configuration
- Deploying into an unknown or existing production project without verifying its identity

If user-owned Vercel and Supabase projects are already configured, credentials are available, targets are verified, and deployment requires no paid purchase or destructive action, deployment may proceed followed by smoke testing.

Otherwise, finish all deployable code and stop only at the external deployment gate. Report:

- Exact missing credential or account
- Exact command the user must run
- Exact environment values required
- Whether the blocker affects web, database, integration, Android, or iOS
- Everything already verified locally

Commit:

```text
chore(release): complete phase 39 deployment readiness
```

Push the final commits without force.

---

# 23. Required calculator acceptance inventory

Before declaring completion, verify every calculator below exists as a registered, tested module and is available in the appropriate web and mobile Calculator Hub.

## Academic

- GPA
- CGPA

## Retirement and independence

- FIRE
- Retirement corpus
- NPS
- Gratuity
- EPF
- APY

## Investments and wealth

- SIP
- Step Up SIP
- Lumpsum
- SWP
- Mutual Funds
- SSY
- PPF
- FD
- RD
- NSC
- Post Office MIS
- SCSS
- Stock Average
- Brokerage
- Margin
- ROI
- CAGR
- XIRR

## Loans and interest

- Generic EMI
- Home Loan EMI
- Car Loan EMI
- Simple Interest
- Compound Interest
- Flat versus Reducing Rate EMI

## Income and taxation

- Salary and Net Take-home
- Income Tax
- TDS
- HRA
- GST

## Economic

- Inflation-adjusted Prices

No item may be considered complete merely because a placeholder manifest exists.

Each must have:

- Validated inputs
- Typed outputs
- Decimal-safe implementation where relevant
- Formula documentation
- Assumption disclosure
- Tests
- Registry entry
- Web presentation
- Mobile presentation

---

# 24. Dependency management

Before adding a dependency:

1. Search the workspace for an existing solution.
2. Confirm which package needs it.
3. Confirm compatibility with Next.js and Expo versions.
4. Prefer workspace-scoped installation.
5. Review lockfile changes.
6. Run the audit.
7. Document the reason.

Do not run:

```text
npm audit fix --force
```

Current known audit baseline:

- 13 moderate Expo/React Native transitive advisories
- 0 high advisories
- Last successful web production audit: 0 vulnerabilities
- npm’s advisory endpoint may occasionally time out

A timeout is neither a clean result nor a new vulnerability. Record it accurately.

Do not perform unrelated major upgrades during feature phases. Place necessary major upgrades into an explicit documented maintenance commit only if blocking.

For Python dependencies, use the repository’s established environment and lock mechanism. Do not create an unrelated second Python environment.

---

# 25. Test continuity

Use this test cadence:

## Every phase

- New focused tests
- Affected package tests
- Affected package type-check
- Affected package build
- Public-import test
- Relevant lint

## Every phase pair

- Full workspace tests
- Full type-check
- Full lint
- All affected builds
- Next.js production build
- Mobile test suite
- Expo Doctor
- Android/iOS/web export checks where mobile code changed
- Audit
- Git clean check

## Every vertical-slice closure

At Phases 17, 27, and 38:

- Full contract suites
- Full integration tests
- Cross-platform workflow tests
- Documentation audit
- Dependency-direction audit
- Dead-code and placeholder scan
- Credential and personal-data scan
- Accessibility review
- Runtime inspection

Never delete, skip, or weaken an existing test to make a phase pass unless the test is demonstrably incorrect and the correction is documented.

---

# 26. Blocker handling

Do not stop for:

- A normal implementation decision
- A fixable test failure
- A missing internal helper
- A package requiring a compatible version
- A documentation mismatch
- A routine refactor inside the current scope
- An npm audit endpoint timeout
- Lack of native iOS testing on Windows

Stop only when:

- User-owned changes conflict materially with required edits
- The repository has unexplained remote divergence
- Credentials are required and unavailable
- A paid service must be purchased
- A destructive remote migration would be required
- A production deployment target cannot be verified
- An app-store submission requires user-owned legal/account decisions
- Official financial rules cannot be verified and no configurable implementation is possible
- A repeated technical blocker remains after reasonable in-scope investigation

Before stopping:

1. Preserve all completed work.
2. Commit only completed phases.
3. Leave incomplete work uncommitted or clearly isolated.
4. Update `EXECUTION_LEDGER.md`.
5. Report the exact blocker and the smallest user action needed.
6. Do not claim later phases are complete.

---

# 27. Final definition of done

The mission is complete only when:

- Phases 12–39 have individual status records.
- Every completed phase has its own commit.
- All commits are pushed or push failure is documented.
- Education remains green.
- Health is complete across domain, services, storage, web, and mobile.
- Finance is complete across domain, calculators, services, storage, web, and mobile.
- Every required calculator is implemented.
- Web and mobile share durable data.
- Authentication protects private data.
- RLS prevents cross-owner access.
- Navigation and widget registration are modular.
- Today and Planner are functional.
- Settings are functional.
- Export, import, backup, and restore are functional.
- Strava is optional and isolated.
- Portfolio privacy boundaries are verified.
- Full tests pass.
- Lint passes.
- Type-check passes.
- Builds pass.
- Migrations pass.
- Security checks pass.
- Deployment artifacts are ready.
- The working tree is clean.
- No secrets or personal data are committed.
- Remaining external deployment or app-store steps are clearly documented.

---

# 28. Final report

Return one consolidated report containing:

- Overall outcome
- Project path
- Branch
- Starting commit
- Final commit
- Push status
- Working-tree status
- Phase-by-phase table for Phases 12–39
- Commit hash for every phase
- Files added, modified, and removed
- Packages created
- Dependencies added
- Migrations added
- Health functionality
- Finance functionality
- Complete calculator inventory
- Web routes
- Mobile routes
- Today and Planner functionality
- Authentication model
- RLS and security model
- Synchronization behavior
- Offline behavior
- Backup and restore behavior
- Strava status
- Portfolio status and privacy behavior
- Test totals by workspace
- Lint result
- Type-check result
- Build results
- Next.js result
- Expo Doctor result
- Platform export results
- Database integration-test result
- Migration-test result
- E2E result
- Accessibility result
- Security review result
- Dependency audit result
- Deployment status
- Exact external blockers, if any
- Known limitations
- Documentation index

Do not conceal failed checks. Clearly distinguish:

- Implemented and tested
- Implemented but not manually verified
- Exported but not run natively
- Deployment-ready but not deployed
- Blocked by missing external credentials
- Deferred because explicit user authorization is required