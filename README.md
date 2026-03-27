# @koppajs/koppajs-kpa-check

`@koppajs/koppajs-kpa-check` is the KoppaJS CLI diagnostics runner for `.kpa` files.
It resolves one or more filesystem targets, delegates semantic analysis to
`@koppajs/koppajs-language-core`, and emits deterministic command-line diagnostics.

## Purpose

This repository exists to do one job well:

- accept explicit file and directory targets for `.kpa` analysis
- collect shared KoppaJS diagnostics outside editor or language-server hosts
- print stable, grep-friendly warning lines and explicit exit codes
- keep the CLI surface thin so language semantics continue to live in
  `@koppajs/koppajs-language-core`

It is not a parser fork, a formatter, or a replacement for the language server.

## Repository Classification

- Repo type: CLI diagnostics package
- Runtime responsibility: filesystem target resolution, workspace-graph
  orchestration, output formatting, and process exit-code selection
- Build-time responsibility: compile the TypeScript package, emit declarations,
  and validate the repository quality gates
- UI surface: none
- Maturity level: `v0` stabilization

## Ownership Boundaries

- [`src/cli.ts`](./src/cli.ts) owns executable startup only.
- [`src/runner.ts`](./src/runner.ts) owns the diagnostics-runner contract:
  target resolution, ordering, language-core calls, output formatting, and exit
  codes.
- [`src/index.ts`](./src/index.ts) owns the minimal programmatic package export.
- [`src/test/unit/`](./src/test/unit) owns unit and lightweight integration
  coverage for the runner.
- [`scripts/`](./scripts) owns repository-only quality guards.
- Root governance files and [`docs/`](./docs) own the repository doctrine,
  specs, and quality baseline.

Language analysis rules, diagnostic messages, and workspace indexing remain the
responsibility of `@koppajs/koppajs-language-core`.

## Public Contract

The stable public surface of this repository is intentionally small:

- the `kpa-check [targets...]` executable
- `kpa-check --help` and `kpa-check --version`
- defaulting to the current working directory when no target is supplied
- rejecting any requested target that does not exist with exit code `2`
- scanning all reachable `.kpa` files across the resolved target set
- printing diagnostics as `path:line:character warning message`
- emitting a single JSON document with `--json`
- returning exit code `0` for success, `1` for diagnostics, and `2` for invalid
  input
- the root package export `runKpaCheck(argv, options?)` plus its public runner
  types for programmatic reuse

The governing behavior spec is
[docs/specs/diagnostics-runner-contract.md](./docs/specs/diagnostics-runner-contract.md).

## Usage

Installed command:

```bash
kpa-check src
```

Help:

```bash
kpa-check --help
```

Version:

```bash
kpa-check --version
```

Current working directory:

```bash
kpa-check
```

Multiple targets:

```bash
kpa-check src components/Page.kpa
```

Machine-readable JSON output:

```bash
kpa-check --json src
```

Programmatic usage:

```ts
import { runKpaCheck } from '@koppajs/koppajs-kpa-check';

const exitCode = runKpaCheck(['src']);
```

Programmatic JSON output:

```ts
import { runKpaCheck } from '@koppajs/koppajs-kpa-check';

const exitCode = runKpaCheck(['src'], {
  outputFormat: 'json',
});
```

## JSON Output

`--json` writes exactly one JSON document to stdout for each invocation,
including clean runs, diagnostics, help/version output, and invocation errors.

For diagnostics runs, the payload includes:

- `kind`, `status`, and `exitCode`
- `cwd`, requested targets, resolved targets, and missing targets
- a `summary` with checked-file and diagnostic counts
- a sorted `diagnostics` array with `filePath`, `relativeFilePath`, `line`,
  `character`, `severity`, `message`, and optional `code` / `data`

The current JSON severity is always `warning`, matching the text output format.

## Exit Codes

- `0`: all reachable `.kpa` files were checked and no diagnostics were found,
  or no `.kpa` files were reachable, or `--help` / `--version` completed
- `1`: at least one diagnostic was emitted
- `2`: the invocation itself was invalid, currently because at least one target
  path does not exist or an unknown/conflicting CLI option was provided

## Ecosystem Fit

`@koppajs/koppajs-kpa-check` complements the rest of the KoppaJS language toolchain:

- `@koppajs/koppajs-language-core` owns parsing, indexing, and diagnostics
- `@koppajs/language-server` exposes the same language layer through LSP
- editor integrations can use the language server for interactive workflows
- `@koppajs/koppajs-kpa-check` remains the narrow non-editor entry point for CI,
  scripts, and local validation

The package intentionally stays thin so diagnostics behavior evolves in one
place.

## Quality Baseline

The enforced repository checks are:

- `npm run check`
- `npm run validate`

The release candidate should also pass:

- `npm run release:check`

## Release Model

Releases are manual and tag-driven through GitHub Actions.

- `package.json` defines the intended release version
- `CHANGELOG.md` records the release notes
- `RELEASE.md` defines the repository-specific release workflow
- `.github/workflows/release.yml` validates and publishes tagged releases

## Governance

Repository governance lives in:

- [AI_CONSTITUTION.md](./AI_CONSTITUTION.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [DECISION_HIERARCHY.md](./DECISION_HIERARCHY.md)
- [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)
- [RELEASE.md](./RELEASE.md)
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [ROADMAP.md](./ROADMAP.md)
- [docs/meta/README.md](./docs/meta/README.md)
- [docs/meta/maintenance.md](./docs/meta/maintenance.md)
- [docs/meta/tooling-baseline.md](./docs/meta/tooling-baseline.md)
- [docs/meta/version-compatibility.md](./docs/meta/version-compatibility.md)
- [docs/architecture/README.md](./docs/architecture/README.md)
- [docs/quality/README.md](./docs/quality/README.md)

## License

Apache License 2.0
