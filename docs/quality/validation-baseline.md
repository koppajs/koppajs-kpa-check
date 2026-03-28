# Validation Baseline

## Enforced Checks

- `npm run check:docs`
- `npm run check:meta`
- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm run test:dist`
- `npm run check`
- `npm run validate`
- `npm run release:check`

## Automation

- GitHub Actions CI runs `npm run validate` on pull requests and on pushes to
  `main` and `develop` with Node.js 22 and 24.
- GitHub Actions release automation runs on `vX.Y.Z` tags, uses the maintainer
  default from `.nvmrc`, validates the package, verifies the publishable payload
  with `npm run release:check`, requires the tagged commit to be on `main`,
  verifies the tag version against `package.json`, creates a GitHub Release, and
  then publishes to npm.
- The published package remains root-entry-only through `package.json`
  `exports["."]`.

## Current Tooling Position

- TypeScript strict mode is enforced.
- Vitest is the only automated test runner.
- ESLint is enforced as a repository quality gate.
- The tracked `.npmrc` enforces compatible Node.js and npm versions during
  install with `engine-strict=true`.
- The package declares support for Node.js `>=22` and npm `>=10`; CI currently
  validates on Node.js 22 and 24.
- The `dist` smoke test ensures the built CLI can resolve package metadata and
  execute through the published runtime path.

## Rationale

This repository is intentionally small, but it sits directly on the
`@koppajs/koppajs-language-core` contract. Structural docs, semantic docs, and
release-payload checks therefore protect against the kinds of drift that would
break downstream consumers without changing much local source code.
