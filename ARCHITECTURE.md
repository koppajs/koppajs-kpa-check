# Architecture

## System Overview

`@koppajs/koppajs-kpa-check` is a small Node.js CLI package that resolves explicit
filesystem targets, asks `@koppajs/koppajs-language-core` for all reachable `.kpa`
files, collects diagnostics for those files, and emits deterministic command
output plus an exit code. It also owns the minimal CLI control surface for
`--help`, `--version`, and `--json`.

The repository has one runtime concern and one build concern:

- Runtime: execute the diagnostics runner through `kpa-check` or
  `runKpaCheck()`
- Build-time: compile TypeScript, emit declarations, and verify repository
  quality gates before publishing

## Repository Classification

- Repo type: CLI diagnostics package
- Runtime responsibility: target resolution, workspace-graph orchestration,
  output formatting, and exit-code selection
- Build-time responsibility: package assembly and repository verification
- UI presence: none
- Maturity level: `v0` stabilization

## Repository Modules

### `src/cli.ts`

Owns executable startup only:

- read `process.argv`
- call `runKpaCheck`
- assign `process.exitCode`

It must not grow independent business logic.

### `src/runner.ts`

Owns the package behavior:

- parse CLI control flags
- print help and version output without touching the workspace graph
- resolve and deduplicate target paths
- reject missing targets explicitly
- construct the `KpaWorkspaceGraph`
- enumerate all reachable `.kpa` files across the resolved target set
- collect diagnostics for those files
- format diagnostics and summaries in text or JSON form
- select exit code `0`, `1`, or `2`

### `src/index.ts`

Owns the narrow programmatic package surface. It re-exports only the supported
runner entry point and its public runner types.

### `src/test/unit/`

Owns unit and lightweight integration coverage for:

- help and version output
- target resolution
- diagnostic formatting
- JSON output and invocation-error serialization
- mixed file and directory target handling
- real workspace-graph diagnostics behavior

### `scripts/`

Owns repository-only checks:

- meta-layer presence
- text-file formatting hygiene

### Meta Layer

The repository governance lives in root documents plus `docs/meta/`,
`docs/architecture/`, `docs/adr/`, `docs/specs/`, and `docs/quality/`.

## Public Contract Surface

The contract-bearing surfaces are:

- CLI behavior through `kpa-check [targets...]`
- CLI control flags `--help`, `--version`, and `--json`
- stable exit-code semantics
- stable diagnostic output format in text and JSON modes
- the root package export `runKpaCheck(argv, options?)` and its public runner
  types
- the published package payload defined in `package.json`

## Execution Flow

1. The executable or consumer calls `runKpaCheck`.
2. The runner parses control flags and handles `--help` / `--version` early.
3. The runner resolves targets relative to the current working directory.
4. Duplicate targets are removed in first-seen order.
5. If any target does not exist, the runner prints an explicit error and
   returns exit code `2`.
6. The runner creates a `KpaWorkspaceGraph` rooted at the resolved targets.
7. The runner asks the graph for all reachable `.kpa` file paths.
8. If no `.kpa` files are found, the runner prints the empty-workspace message
   and returns `0`.
9. Diagnostics are collected for the resolved file set.
10. Output is emitted in deterministic text order or as one JSON document.
11. The runner returns `1` if any diagnostics were printed, otherwise `0`.

## Data And Dependency Flow

- Runtime dependencies:
  - Node.js built-ins for filesystem and path work
  - `@koppajs/koppajs-language-core` for indexing and diagnostics
- Development dependencies:
  - TypeScript for authoring and builds
  - Vitest for tests
  - ESLint for lightweight static rules

The runner must not depend on `dist/`, documentation files, or unpublished
repository internals from sibling packages.

## Important Invariants

- The CLI must not silently ignore missing targets.
- Unknown CLI options must fail explicitly with exit code `2`.
- Directory targets and explicit `.kpa` file targets must both contribute to the
  checked file set.
- The runner must not call `process.exit`; only the CLI entry may set
  `process.exitCode`.
- Output order must remain deterministic across file path, line, character, and
  message ordering.
- JSON mode must emit one machine-readable document to stdout instead of mixed
  stdout/stderr text output.
- The root package export stays minimal and must not expose internal helpers by
  accident.

See [docs/architecture/module-boundaries.md](./docs/architecture/module-boundaries.md)
for the allowed dependency directions.
