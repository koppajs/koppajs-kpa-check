# Kpa-Check/Core Compatibility Policy

This document defines how `@koppajs/koppajs-kpa-check` tracks
`@koppajs/koppajs-language-core`.

## Source Of Truth

The effective compatibility contract is the dependency range in `package.json`.

For the current release line, `kpa-check` declares:

- `@koppajs/koppajs-language-core: ^0.1.3`

The package must not claim compatibility outside the range it actually declares
and validates.

## Current Policy

While both packages are in the `0.x` phase, compatibility is tracked
conservatively:

- `kpa-check` releases must validate against the exact minimum core version
  declared in `package.json`
- patch-level `kpa-check` releases may widen the supported core range within the
  same `0.1.x` line when the CLI contract does not change
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
