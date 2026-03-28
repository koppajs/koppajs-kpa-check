# Tooling Baseline

## Purpose

This document records the active local tooling baseline and the intentional
choices behind it.

## Active Tooling

- npm for dependency installation and script execution
- TypeScript for type checking and build output
- Vitest for automated tests
- ESLint for static analysis of TypeScript and repository scripts
- Husky for lightweight local guards
- Node-based repository scripts for documentation, meta-layer, and runtime smoke
  validation
- GitHub Actions for CI validation and tag-driven release publishing

## Engine Enforcement

- `package.json` requires Node.js `>=22` and npm `>=10`
- `.nvmrc` keeps the maintainer default on Node.js 22
- `.npmrc` enforces `engine-strict=true`
- `.github/workflows/ci.yml` validates on Node.js 22 and 24
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
