# Finance mobile feature and Calculator Hub

> **Phase 31 update:** authenticated Finance records and supported calculator
> scenarios now use the shared owner-scoped Supabase repository. Favorites,
> recent-calculator display state, and academic calculator comparisons remain
> session UI state because no domain repository contract declares them.

Phase 26 composes the shared `@aperture/finance` application service, `@aperture/finance-memory` repository, and `@aperture/calculators` presentation registry into an Expo and React Native feature. The mobile feature imports no web components and contains no domain formulas.

## Composition and lifetime

The `(tabs)` route-group layout mounts one `FinanceProvider` above both `/finance` and `/calculators`. The provider creates its runtime once, so records, favorites, recent calculators, and saved scenario comparisons survive navigation between both route trees. A provider remount creates a fresh, isolated memory repository.

The production mobile runtime uses `expo-crypto.randomUUID`, an injected clock, a synthetic owner, and the public Finance service. Exact decimal values remain strings from the controlled field through validation, storage, calculation, and display. No screen converts money or rate strings through JavaScript floating-point arithmetic.

## Native routes

| Route | Capability |
| --- | --- |
| `/finance` | Account, expense, and recorded net-worth summaries plus workflow navigation |
| `/finance/accounts` | Create, list, close, and archive manual account records |
| `/finance/transactions` | Create categories and transactions, filter the ledger, and delete entries |
| `/finance/budgets` | Create dated budgets, expense categories, and category allocations |
| `/finance/assets` | Create, list, and archive manually valued assets |
| `/finance/liabilities` | Create, list, and archive manually recorded balances |
| `/finance/investments` | Create linked financial and investment account records |
| `/finance/loans` | Create and close loan records |
| `/finance/goals` | Create, complete, and archive goals |
| `/calculators` | Search, filter, favorite, and revisit all 38 calculators in nine categories |
| `/calculators/[calculator-id]` | Edit nested example inputs, calculate, reset, save, disclose, and compare scenarios |

The native Calculator Hub and web Calculator Hub consume one presentation registry from `@aperture/calculators`. That registry derives 36 financial entries from the generated Finance plug-in registry and adapts GPA and CGPA through the Education package. Category labels, formulas, assumptions, example inputs, and calculator execution are therefore shared across platforms.

## Mobile interaction and accessibility

Screens use safe-area and keyboard-avoiding containers, controlled inputs, minimum-height touch targets, and explicit accessibility labels. Money, rate, count, GPA, and other numeric fields request a decimal keyboard where their input shape permits it. Invalid submissions keep the user's text visible and announce readable errors.

Growing record sets and calculator result arrays use labelled horizontal `FlatList` collections. Each row has a card alternative, so narrow screens can scroll long results without truncating the underlying text. Status is always written as text. Favorites expose selected state, pending actions expose busy and disabled state, and warnings do not depend on color.

Every Finance and Calculator screen displays the development boundary: data belongs to a synthetic identity, stays only in memory, and resets with the runtime. The notice explicitly rejects bank passwords, PINs, one-time codes, card security codes, and other banking credentials. Calculator results show their formula, assumptions, registered warnings, and estimate context; the feature does not provide financial advice.

## Scenario behavior

Financial scenarios are validated and stored through `FinanceApplicationService.scenarios` and the memory repository. GPA and CGPA are outside the Finance calculator registry, so their scenario history remains in the shared mobile provider. The provider copies saved input and output graphs before retaining them. Two saved runs enable card-based comparison on the calculator screen.

## Verification

The Jest Expo suite covers stable provider lifetime, owner isolation, Strict Mode mutation safety, real account and asset forms, exact decimals, readable loan validation, cross-screen Finance state, service summaries, all 38 registered example executions, all nine categories, search, favorites, GPA scenarios, repository-backed financial scenarios, secure-input copy, numeric keyboards, announced errors, and long accessible result cards.

Phase verification also runs mobile lint and type-check, Expo Doctor, and Metro exports for Android, iOS, and web. Export success verifies bundling for each target; it does not replace native device testing.

## Known limits

- Records and UI preferences are volatile and reset on provider remount or app reload.
- The synthetic owner is not authentication or an authorization boundary.
- Date and time values use validated text entry rather than a native picker.
- Android and iOS exports do not prove behavior on a physical device.
- Durable storage, authentication, synchronization, import/export, and deployment belong to later phases.
