# Quality Gates

## Repository Checks

- `npm run check:docs`: structural and semantic documentation validation.
- `npm run check:meta`
  Verifies the required repository governance files, workflow docs, and
  standard directories exist.
- `npm run format:check`
  Verifies LF endings, trailing-whitespace hygiene, and final newlines for text
  files.
- `npm run lint`
  Verifies lightweight static rules for TypeScript sources and repository
  scripts.
- `npm run typecheck`
  Verifies TypeScript correctness.
- `npm test`
  Verifies runner behavior through unit tests and real
  `@koppajs/koppajs-language-core` integration scenarios.
- `npm run build`
  Emits the package build and declarations.
- `npm run test:dist`
  Verifies the built CLI can execute through the published runtime path.
- `npm run release:check`
  Verifies the package payload can be packed for release.
- `npm run validate` via `prepack`
  Re-runs the repository baseline before package creation or publish.
- `npm run check`
  Runs the repository baseline in one command.

## Hosted Automation

- `.github/workflows/ci.yml`
  - runs on pull requests and on pushes to `main` and `develop`
  - validates `npm run validate` on Node.js 22 and 24
- `.github/workflows/release.yml`
  - runs on `v*.*.*` tag pushes
  - reruns `npm run validate` and `npm run release:check` on the maintainer
    default from `.nvmrc`
  - verifies the tagged commit is on `main` and that the tag matches
    `package.json` before publish

## Rules

- Every user-visible behavior change must have a matching test update.
- Package-surface changes must be reflected in specs and README content.
- Repository-quality tooling should remain small and justified by real needs.
