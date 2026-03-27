# AI Constitution

## Purpose

This repository ships the KoppaJS `.kpa` diagnostics runner. Its job is to
turn explicit filesystem targets into deterministic CLI diagnostics by reusing
`@koppajs/koppajs-language-core` instead of reimplementing language behavior locally.

## Core Principles

### 1. The package stays a thin adapter

- Language parsing, indexing, and semantic rules belong in
  `@koppajs/koppajs-language-core`.
- `@koppajs/koppajs-kpa-check` may orchestrate the language layer, but it must not fork
  or shadow it.
- The CLI entry file must remain a startup shim, not a second application
  layer.

### 2. Explicit input handling beats convenient guessing

- Every requested target must be resolved from the current working directory.
- Missing targets are an invocation error, not something to ignore silently.
- Mixed file and directory targets must behave predictably and cover the full
  requested target set.

### 3. Deterministic output is part of the contract

- File processing order must remain stable.
- Diagnostic formatting must stay machine-readable and grep-friendly.
- Exit codes must reflect invocation failure, clean success, and emitted
  diagnostics distinctly.

### 4. The published surface stays narrow

- The executable is the primary public contract.
- The root package export exists only for programmatic reuse of the same runner
  behavior.
- Internal helpers should not be promoted to package exports without a specific
  contract reason.

### 5. Documentation is implementation

- Specs, architecture, testing strategy, and README content must match the code.
- If behavior changes, the governing spec and tests change in the same work.
- If docs and implementation disagree, the mismatch is a defect.

## Required Reading Order Before Edits

1. [DECISION_HIERARCHY.md](./DECISION_HIERARCHY.md)
2. [ARCHITECTURE.md](./ARCHITECTURE.md)
3. Relevant spec in [docs/specs/](./docs/specs)
4. Relevant ADRs in [docs/adr/](./docs/adr)
5. [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)
6. [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)

## Required Workflow

1. Classify the change against the current contract before editing code.
2. Update or add the governing spec if behavior changes.
3. Add or update tests that cover the observable result.
4. Keep the runner thin and reuse existing repository patterns.
5. Update architecture, README, and quality docs in the same change when their
   subjects move.

## Public Contract Guardrails

Treat the following as protected contract unless a spec or ADR changes them
explicitly:

- the `kpa-check [targets...]` command
- defaulting to the current working directory when no target is provided
- rejecting missing targets with exit code `2`
- collecting diagnostics through `KpaWorkspaceGraph`
- formatting diagnostics as `path:line:character warning message`
- emitting diagnostics in deterministic file-path, line, character, and
  message order
- exit code `0` for success, `1` for diagnostics, `2` for invalid input
- the root package export `runKpaCheck(argv, options?)` and its public runner
  types

## Meta-Layer Maintenance Rule

When any of these change, update the corresponding documents in the same work:

- behavior or outputs -> `docs/specs/*`, `README.md`, tests
- architecture or module boundaries -> `ARCHITECTURE.md`,
  `docs/architecture/*`
- testing or quality gates -> `TESTING_STRATEGY.md`, `docs/quality/*`
- lasting technical direction -> new ADR in `docs/adr/*`
- contributor workflow -> `CONTRIBUTING.md`
