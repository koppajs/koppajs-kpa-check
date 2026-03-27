# Testing Strategy

## Goal

Testing in `@koppajs/koppajs-kpa-check` protects the observable diagnostics-runner
contract: target resolution, stable output, and exit-code behavior.

## Test Layers

### 1. Repository guards

- `npm run check:meta`
- `npm run format:check`
- `npm run lint`
- `npm run typecheck`

Purpose:

- keep the meta layer complete
- keep text-file hygiene consistent
- catch static code issues early

### 2. Runner tests

- `npm test`

Purpose:

- verify help and version behavior
- verify missing-target handling
- verify diagnostic formatting
- verify JSON output and serialized invocation errors
- verify deterministic diagnostic ordering
- verify mixed file and directory target behavior
- verify real integration with `KpaWorkspaceGraph`

### 3. Build and package verification

- `npm run build`
- `npm run pack:dry-run`
- `npm run validate` via `prepack`

Purpose:

- verify emit correctness
- verify package payload viability
- fail packaging early if the repository baseline regressed

### 4. Full repository gate

- `npm run check`

Purpose:

- run the repository baseline in the same order contributors should trust it

## When To Add Tests

Add or update tests when changing:

- CLI flags or output modes
- target resolution rules
- output formatting
- exit-code semantics
- programmatic runner options
- package entrypoints

## Playwright Policy

This repository has no user-operated UI. Do not add Playwright unless the
repository gains a real supported UI surface.

## Mocking Policy

- Prefer real filesystem fixtures for language-core integration checks.
- Use injected runner collaborators for unit tests when isolating a decision
  branch.
- Avoid tests that only restate implementation without checking an observable
  outcome.

## Coverage Expectation

The repository optimizes for scenario coverage rather than a numeric threshold.
Every user-visible change should protect the affected runtime path.

## Required Documentation Updates

When behavior changes:

- update the governing spec in `docs/specs/`
- extend the relevant tests
- update `README.md` if the public contract changed
- update `ARCHITECTURE.md` if module boundaries or invariants moved
