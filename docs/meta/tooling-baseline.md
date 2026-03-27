# Tooling Baseline

## Active Tooling

The repository currently uses:

- TypeScript (`tsc`) for compilation and typechecking
- ESLint for static analysis
- Vitest for unit and lightweight integration tests
- custom Node.js scripts for meta-layer checks and text-file hygiene
- npm with `package-lock.json` as the package-management baseline
- GitHub Actions for CI validation and tag-driven release publishing

## Script Surface

The supported scripts are:

- `npm run check:meta`
- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run prepack`
- `npm run release:check`
- `npm test`
- `npm run check`
- `npm run validate`

## Deliberate Exclusions

The repository intentionally does not currently include:

- Prettier
- Playwright or browser-E2E tooling
- Husky or lint-staged hooks
- coverage thresholds or coverage-report tooling
- additional release automation beyond the tag-driven GitHub Actions flow

These exclusions are intentional because the package has no UI surface and its
remaining complexity is concentrated in deterministic CLI behavior and its
dependency on `@koppajs/koppajs-language-core`.
