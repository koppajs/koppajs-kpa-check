# Repository Map

## Purpose

This document describes the current top-level responsibilities in this
repository. Update it when boundaries move.

## Top-Level Structure

### `src/`

Runtime source for `@koppajs/koppajs-kpa-check`.

- `src/cli.ts`
  - executable startup only
- `src/index.ts`
  - published root entry point
- `src/runner.ts`
  - diagnostics-runner implementation and CLI contract behavior
- `src/test/`
  - Vitest coverage for public exports, package metadata, and runner behavior
    against real `@koppajs/koppajs-language-core` scenarios

### `docs/`

Repository memory and behavioral contracts.

- `docs/specs/`
  - behavior-level specifications
- `docs/architecture/`
  - module-boundary details
- `docs/adr/`
  - long-lived architecture decisions
- `docs/meta/`
  - repository map, tooling baseline, compatibility policy, and maintenance
    rules
- `docs/quality/`
  - validation baseline and practical quality-gate guidance

### `.github/`

Hosted automation and workflow guidance.

- `.github/workflows/`
  - CI and release workflows plus workflow documentation

### `.husky/`

Local commit-time checks.

- `pre-commit`
  - runs `npm run check:docs`

### `scripts/`

Lightweight repository-local validation scripts.

- `check-doc-contract.mjs`
  - governed root document contract validation
- `check-doc-semantics.mjs`
  - semantic documentation consistency checks against package and workflow facts
- `check-meta-layer.mjs`
  - meta-layer and workflow-file presence validation
- `format-check.mjs`
  - text-file formatting hygiene checks
- `check-dist-runtime.mjs`
  - post-build runtime smoke test for the published CLI entry

## Boundary Rules

- Runtime code in `src/` must not depend on docs, scripts, or hosted workflow
  files.
- Scripts validate repository contracts; they do not define runtime semantics.
- Documentation must describe implemented CLI and workflow behavior, not
  speculative future features.
