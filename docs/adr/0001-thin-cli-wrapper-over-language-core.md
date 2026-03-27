# ADR 0001: Keep `kpa-check` A Thin Wrapper Over `language-core`

## Status

Accepted

## Context

`@koppajs/koppajs-kpa-check` exists to run KoppaJS diagnostics outside editor and
language-server hosts. The repository depends on `@koppajs/koppajs-language-core`,
which already owns parsing, indexing, and diagnostics behavior.

Without a clear boundary, the CLI package could start duplicating language
logic, exposing unstable helpers, or embedding process behavior into the root
package export.

## Decision

The repository will remain a thin adapter over `@koppajs/koppajs-language-core`.

Concretely:

- `src/cli.ts` is only the executable startup shim
- `src/runner.ts` owns the runner contract and returns exit codes instead of
  calling `process.exit`
- the root package export stays narrow and exposes only `runKpaCheck()` plus
  its public runner types
- target expansion and diagnostic ordering are handled explicitly in the runner
  instead of relying on ambiguous host behavior

## Consequences

### Positive

- language semantics remain centralized in one package
- the CLI stays testable without spawning a child process
- package imports no longer execute command behavior implicitly
- the published surface remains small and documentable

### Negative

- internal helper functions stay unexported even when they are convenient for
  tests
- new runtime capabilities should generally be added upstream to
  `@koppajs/koppajs-language-core` first, which can slow local changes

## Related Documents

- [../../specs/diagnostics-runner-contract.md](../../specs/diagnostics-runner-contract.md)
- [../../../ARCHITECTURE.md](../../../ARCHITECTURE.md)
