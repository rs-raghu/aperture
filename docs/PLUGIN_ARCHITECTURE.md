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

Phase 32 enablement is intentionally scoped to the mounted shell. Phase 34 will persist owner-scoped settings across devices. Disabling a feature only removes its navigation and presentation; it never deletes records.

Phase 33 uses the same registry for Today composition. Planner, Education, Health, and Finance declare their widget metadata in manifests. The composition root connects each widget ID to an owner-scoped contributor, and the Today feature consumes the generic aggregation service rather than importing another feature's UI internals. Widget failures remain isolated and widget visibility can be changed for the mounted Today screen.

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
