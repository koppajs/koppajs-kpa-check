# Tooling Baseline

## Purpose

This document records the active local tooling baseline and the intentional
choices behind it.

## Active Tooling

- npm for release installs, publish checks, and compatibility validation
- pnpm for the supported alternate local install and validation flow
- TypeScript for type checking and build output
- Vitest for automated tests
- ESLint for static analysis of TypeScript and repository scripts
- Husky for lightweight local guards
- Node-based repository scripts for documentation, meta-layer, and runtime smoke
  validation
- GitHub Actions for CI validation and tag-driven release publishing

## Dependency Compatibility

- TypeScript 6.0.3 matches language-core 0.2 and the TypeScript-ESLint 8.72 peer range (`>=4.8.4 <6.1.0`). TypeScript 7 is intentionally excluded until that peer contract supports it.
- Vitest 5 and Vite 8 use the current test-tool lines. ESLint 10 uses flat configuration without removed CLI ignore flags.
- Node.js 22 types stay on the latest 22.x release to avoid accepting runtime APIs missing from the minimum supported Node.js line.
- Core 3.0.11, Router 0.1.8, and Vite plugin 2.0.0 are development-only dependencies for the shared CLI/build integration test; language-core 0.2.0 remains the only direct runtime dependency.
- Both `package-lock.json` and `pnpm-lock.yaml` must remain synchronized with the manifest and validated through their supported install paths.

## Security Overrides

- Both npm `overrides` and `pnpm.overrides` pin transitive `minimatch` to
  `11.0.3` to fix GHSA-g3hv-75wg-m249 (CVE-2026-118764). ESLint 10.14 and
  TypeScript-ESLint 8.72 still request the vulnerable 10.x line.
- This is a deliberate major-version override. Verify actual ESLint file
  selection and TypeScript rules, both frozen install paths, and full audits
  when changing it. Do not suppress or ignore the advisory.
- Remove the paired overrides once upstream dependency ranges select a fixed
  version without them; keep both package-manager settings synchronized.

## Engine Enforcement

- `package.json` requires Node.js `^22.13.0 || ^24.0.0 || >=26.0.0` and npm `>=10`
- `.nvmrc` keeps the maintainer default on Node.js 22
- `.npmrc` enforces `engine-strict=true`
- `.github/workflows/ci.yml` validates on Node.js 22 and 24 through npm and pnpm
- `.github/workflows/release.yml` uses the maintainer default from `.nvmrc`

## Repository Gates

- `npm run check:docs`: structural and semantic documentation validation
- `npm run check:meta`: repository-shape and workflow-file validation
- `npm run format:check`: verify formatting without rewriting files
- `npm run lint`: run ESLint as a failing quality gate
- `npm run typecheck`: type-check the repository source
- `npm test`: run the runner and package test suite once
- `npm run build`: emit the published package build and declarations
- `npm run test:dist`: smoke-test the built CLI runtime
- `npm run check`: local gate for docs, validation, and release payload checks
- `npm run validate`: CI/release gate for docs, meta, format, lint, typecheck,
  tests, build, and `dist` smoke coverage
- `npm run release:check`: verify the publishable npm payload
- `npm run lock:sync:npm`: refresh `package-lock.json` with the CI/release npm version

## Deliberate Omissions

- No Prettier: repository formatting is intentionally handled by the local
  text-file guard.
- No browser or UI tooling: this package has no repository-local UI surface.
- No numeric coverage threshold: the repository optimizes for scenario coverage
  over a single percentage gate.

## Maintenance Rule

Add new tooling only when it solves an active repository problem that the
current gates do not already cover. When tooling changes, update this file,
`TESTING_STRATEGY.md`, `docs/quality/`, and `.github/workflows/README.md` in
the same change.
