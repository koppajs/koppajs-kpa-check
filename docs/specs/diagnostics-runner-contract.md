# Spec: Diagnostics Runner Contract

## status

Accepted

## description

`@koppajs/koppajs-kpa-check` runs KoppaJS diagnostics for explicit filesystem targets
through `kpa-check` or the root package export `runKpaCheck()`.

## behavior

The repository must:

1. accept `--help`, `--version`, and `--json` as supported CLI flags
2. accept zero or more file or directory targets
3. default to the current working directory when no target is provided
4. resolve targets relative to the current working directory
5. deduplicate identical resolved targets
6. reject the invocation if any resolved target does not exist
7. reject unknown or conflicting CLI control options with exit code `2`
8. construct a `KpaWorkspaceGraph` rooted at the resolved target set
9. enumerate every reachable `.kpa` file across that target set
10. print `kpa-check hat keine .kpa-Dateien gefunden.` and return `0` when no
   `.kpa` files are reachable
11. print diagnostics as `path:line:character warning message`
12. emit diagnostics in deterministic file-path, line, character, and message
    order
13. print a success summary and return `0` when files were checked but no
    diagnostics were emitted
14. print a diagnostics-summary message and return `1` when at least one
    diagnostic was emitted
15. print help text and return `0` for `--help`
16. print the package version and return `0` for `--version`
17. emit one machine-readable JSON document to stdout when `--json` is set
18. keep the root package export limited to `runKpaCheck()` and its public
    runner types

## inputs

- command-line arguments after `kpa-check`
- current working directory
- filesystem state for requested targets
- `@koppajs/koppajs-language-core` workspace graph behavior
- package name and version metadata for help/version output
- optional programmatic overrides for `cwd`, I/O, output format, path existence
  checks, workspace-graph creation, and package metadata

## outputs

- stdout diagnostics and success messages
- stderr invocation-error and diagnostics-summary messages
- stdout JSON documents when JSON mode is selected
- numeric exit code from `runKpaCheck()`

## constraints

- The runner must not call `process.exit`.
- The CLI wrapper may only assign `process.exitCode`.
- Help and version output must not touch the workspace graph or filesystem target
  checks.
- Missing targets must fail the invocation even if other targets exist.
- Directory targets and explicit `.kpa` file targets must both contribute to the
  final checked file set.
- Diagnostic emission order must remain deterministic.
- JSON mode must emit exactly one JSON document to stdout per invocation.
- JSON diagnostics currently use the flattened severity `warning`.
- The runner must not reimplement language diagnostics that belong in
  `@koppajs/koppajs-language-core`.

## edge_cases

- Duplicate targets are ignored after resolution.
- A missing target among otherwise valid targets still returns `2`.
- A directory with no `.kpa` files is a clean `0`, not an error.
- Mixed explicit `.kpa` files and directories must not silently drop the
  directory files.
- Relative output paths may include parent-directory segments when checking
  files outside the current working directory.
- Targets that start with `-` can be passed after `--`.

## acceptance_criteria

1. `kpa-check --help` returns `0` and prints the help text.
2. `kpa-check --version` returns `0` and prints the package version.
3. `kpa-check` with no arguments checks the current working directory.
4. `kpa-check missing.kpa` returns `2` and prints the missing target.
5. `kpa-check src Page.kpa` checks reachable `.kpa` files from both targets.
6. A reachable `.kpa` diagnostic prints in `path:line:character warning message`
   form.
7. Diagnostics for the same file are emitted in stable line, character, and
   message order.
8. `kpa-check --json src` emits one parseable JSON document.
9. Clean runs return `0`; runs with diagnostics return `1`.
10. Importing the root package does not execute the CLI automatically.

## evolution_phase

Stabilizing

## completeness_level

High

## known_gaps

- Diagnostic severity is flattened to `warning` in both text and JSON output.
- The CLI does not currently expose severity filtering.

## deferred_complexity

- additional machine-readable output modes beyond the default JSON schema
- ignore-pattern or configuration-file support
- richer CLI flags once consumer demand is proven

## technical_debt_items

- Revisit the output format only if the shared language layer gains a stable
  severity model that needs to surface here.

## change_management

When this spec changes:

- update `README.md`
- update or add runner tests
- update `ARCHITECTURE.md` if responsibilities or invariants changed
- add or update an ADR if the package scope or public surface changes
