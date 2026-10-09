# Aperture plugin and shell architecture

Phase 32 turns the feature registry into an executable build-time contract. Aperture remains a modular monolith: plugins are source-controlled feature modules compiled with the applications, not third-party code installed or evaluated at runtime.

## Manifest inventory

Each feature owns `plugins/<feature-id>/aperture.plugin.json`. A manifest declares:

- stable feature identity, version, status, default enablement, and whether the feature may be disabled;
- web and mobile routes, primary or secondary navigation placement, search metadata, and session requirements;
- owner-facing permission metadata;
- Today widget contributions;
- calculator module entry points;
- literal web and mobile frontend entry points;
- an optional backend entry point; and
- ordered SQL migration files.

The manifest generator validates identifiers, semantic versions, colors, route shape, source paths, migration extensions, one primary route per feature, and global uniqueness for feature IDs, route IDs, platform route paths, widget IDs, calculator module IDs, and migration paths. Required features must be enabled by default.

## Generated outputs

`npm run generate:plugins` reads every checked-in manifest and writes:

- `packages/feature-registry/src/feature-manifests.generated.ts`, the shared immutable registry input;
- `apps/web/src/generated/plugin-frontends.generated.ts`, with literal web dynamic imports; and
- `apps/mobile/src/generated/plugin-frontends.generated.ts`, with literal mobile dynamic imports.

`npm run validate:plugins` regenerates in memory and fails when committed output has drifted. The feature-registry build also runs this check, so stale generated code cannot enter a successful application build.

Calculator source discovery remains owned by the calculator packages. `npm run generate:calculators` invokes the Finance calculator generator, which discovers every checked-in `*.plugin.ts` module and writes literal imports. Plugin manifests identify the calculator registries contributed to the shell.

## Runtime registry

`@aperture/feature-registry` exposes the validated generated manifests and a synchronous, framework-neutral registry. Web and mobile use it for:

- primary and contextual navigation;
- route matching, including dynamic segments;
- command search;
- feature enablement overrides while preventing required features from being disabled; and
- ordered widget contribution discovery.

Phase 34 persists enablement in the owner-scoped Settings aggregate. Web and mobile shells consume the same manifest-keyed map through their composition roots. Disabling a feature only removes its navigation and presentation; it never deletes records. Manifests with `disableAllowed: false` are enforced again in the Settings service and cannot be disabled by a client request.

Phase 33 uses the same registry for Today composition. Planner, Education, Health, and Finance declare their widget metadata in manifests. The composition root connects each widget ID to an owner-scoped contributor, and the Today feature consumes the generic aggregation service rather than importing another feature's UI internals. Widget failures remain isolated. Phase 34 stores widget visibility in Settings, so Today and the Settings interface share the same owner-scoped preference across platforms.

## Adding a feature

Run:

```text
npm run plugin:create -- <feature-id>
```

The command creates a planned, disabled-by-default manifest plus web and mobile entry points. Add the real routes and module exports, then run:

```text
npm run generate:plugins
npm run validate:plugins
```

The shared shells consume the generated navigation and search metadata without handwritten central imports. File-based route modules remain thin platform adapters and feature implementation stays within its platform or shared package boundary.

## Feature-owned runtime and recovery contributions

An optional `dataContributions` manifest field declares `web`, `mobile`, and `server` entries, each with `source`, a literal `import`, and `exportName`. The source must be a repository-owned `.ts` file and the export name a JavaScript identifier. Generation emits `plugin-data-contributions.generated.ts` for each frontend and `plugin-recovery-adapters.generated.ts` for the Node server. The checked TypeScript signatures validate each exported factory.

Frontend factories receive the owner, shared Supabase client or null for preview, injected clock, and ID generator. They return a feature identity, backup adapters, and a provider wrapper. Composition roots consume this generic list, allowing a new feature to own its service, repository choice, provider, and recovery registration without adding its name to the root. Portfolio demonstrates this contract. Existing Education, Health, Finance, Planner, and Settings composition predates the hook and remains explicit.

Server factories receive a transaction-scoped `SqlExecutor` and return a `BackupFeatureAdapter`. Mutating adapters declare their trusted qualified `transactionTables`; the recovery service validates those identifiers and acquires their locks before mutation. Never import a Node driver or server secret through a frontend factory or the shared package root. Registry generation tests check discovery on both frontends and the server, drift detection, invalid export names, traversal, and missing sources.
