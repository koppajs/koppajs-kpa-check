# Development Rules

## Purpose

These rules describe how code and documentation should evolve in
`@koppajs/koppajs-kpa-check`.

## General Rules

- Keep the package small and explicit.
- Reuse `@koppajs/koppajs-language-core` instead of reimplementing diagnostics logic.
- Prefer minimal edits over broad refactors.
- Keep command behavior deterministic and easy to trace.
- Do not widen the public package surface without a documented reason.

## Code Patterns

### CLI Layer

- `src/cli.ts` should only translate process state into a `runKpaCheck` call.
- Use `process.exitCode`, not `process.exit`, in the CLI entrypoint.
- Avoid top-level side effects in importable modules.

### Runner Layer

- Keep target resolution explicit and testable.
- Sort file-based output when behavior depends on filesystem enumeration.
- Prefer injected collaborators in tests over deep mocking.

## Dependency Rules

- Runtime dependencies must be justified by concrete runner behavior.
- Language behavior belongs upstream in `@koppajs/koppajs-language-core`.
- New runtime dependencies or materially broader package scope require an ADR.
- Repository tooling should stay lightweight and proportionate to repository
  size.

## Documentation Rules

- Behavior changes require a spec update.
- Boundary changes require an architecture update.
- Quality-gate changes require testing-strategy and quality-doc updates.
- README content must reflect the actual public contract.

## Forbidden Or Discouraged Patterns

- silently ignoring invalid targets
- reimplementing workspace-graph or diagnostics logic locally
- import-time execution of command behavior from the root package export
- speculative abstractions for future CLI modes that do not exist yet
- broad formatting or refactoring passes unrelated to the task

## Change Checklist

Before finishing a change, confirm:

1. The governing spec still matches the code.
2. Tests cover the observable behavior that changed.
3. The README still describes the public contract correctly.
4. The meta layer reflects the resulting architecture and quality baseline.

## Documentation Contract Rules

- `README.md`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, and `CONTRIBUTING.md` are governed by [docs/specs/repository-documentation-contract.md](./docs/specs/repository-documentation-contract.md).
- If one of those files changes shape, update the spec and `scripts/check-doc-contract.mjs` in the same change.
- Keep official KoppaJS branding, logo usage, and closing governance sections consistent across the governed root documents.
