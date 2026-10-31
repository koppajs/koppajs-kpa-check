# Kpa-Check/Core Compatibility Policy

This document defines how `@koppajs/koppajs-kpa-check` tracks
`@koppajs/koppajs-language-core`.

## Source Of Truth

The effective compatibility contract is the dependency range in `package.json`.

For the current release line, `kpa-check` declares:

- `@koppajs/koppajs-language-core: ^0.2.2`

The package must not claim compatibility outside the range it actually declares
and validates.

## Validated Ecosystem Baseline

The integration fixture in `src/test/unit/ecosystem.test.ts` validates the same
application through CLI diagnostics and a real Vite production build with:

- `@koppajs/koppajs-core` 3.0.12
- `@koppajs/koppajs-router` 0.1.9
- `@koppajs/koppajs-vite-plugin` 2.0.1
- `@koppajs/koppajs-language-core` 0.2.2
- Vite 8.3.5

Core, Router, and the plugin are development-only integration dependencies.
They do not expand the published CLI runtime dependency surface. The fixture
checks explicit returned component state, bundling, and an unknown template
symbol regression. It does not execute browser rendering or navigation.

The built-CLI regression fixtures in `scripts/check-dist-runtime.mjs` also
validate core 0.2.1 required-default-slot and prop-assignability fixes, including
empty versus populated slots and unrelated script/import errors versus real
prop type mismatches.

The supported Node.js range follows language-core:
`^22.13.0 || ^24.0.0 || >=26.0.0`.

## Current Policy

While both packages are in the `0.x` phase, compatibility is tracked
conservatively:

- `kpa-check` releases must validate against the exact minimum core version
  declared in `package.json`
- patch-level `kpa-check` releases may widen the supported core range within the
  same declared minor line when the CLI contract does not change
- a new core minor line requires an explicit review, validation run, and a
  `kpa-check` release that updates the dependency range

## Request-Visible Core Changes

If `@koppajs/koppajs-language-core` changes behavior that is visible through the
CLI, this package must be reviewed even when no local source changes are needed.

Examples:

- diagnostic messages, codes, or attached metadata change
- diagnostic ordering or workspace-graph behavior changes
- canonical template-syntax support changes
- new language-core severity semantics would need to surface in text or JSON
  output

When that happens:

1. update the dependency range in `package.json`
2. update `CHANGELOG.md` if user-visible CLI behavior changed
3. run `npm run validate`
4. run `npm run release:check`
5. update specs and docs if the CLI contract changed

## Release Rule

Before publishing a `kpa-check` release:

- run `npm run validate`
- run `npm run release:check`
- confirm the declared core range is the range you intend to support

If the intended support window is broader than the declared range, widen the
range first and verify it in the same change.
