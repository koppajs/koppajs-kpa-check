# Quality Gates

## Repository Checks

- `npm run check:meta`
  Verifies the required repository governance files, canonical docs, and
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
  Verifies runner behavior through unit and lightweight integration tests.
- `npm run build`
  Emits the package build and declarations.
- `npm run release:check`
  Verifies the package payload can be packed for release.
- `npm run validate` via `prepack`
  Re-runs the repository baseline before package creation or publish.
- `npm run check`
  Runs the repository baseline in one command.

## Rules

- Every user-visible behavior change must have a matching test update.
- Package-surface changes must be reflected in specs and README content.
- Repository-quality tooling should remain small and justified by real needs.
