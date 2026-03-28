# Workflow Expectations

This repository defines hosted GitHub Actions workflows for CI and releases.
They should enforce the same repository checks described in
`TESTING_STRATEGY.md` and `docs/quality/`.

## Current Baseline Jobs

- CI runs on pull requests and on pushes to `main` and `develop`
- CI validates the repository with `npm run validate` on Node.js 22 and 24
- Release tags rerun `npm run validate` and `npm run release:check` on the
  maintainer default from `.nvmrc`, verify the tagged commit is already on
  `main`, verify the tag version, and then publish to npm

`npm run validate` includes structural docs, semantic docs, meta-layer checks,
formatting, linting, type checks, tests, build output, and the `dist` runtime
smoke test.

## Governance Rule

If hosted workflow behavior changes, update:

- `TESTING_STRATEGY.md`
- `docs/quality/README.md`
- `docs/quality/validation-baseline.md`
- `RELEASE.md`
