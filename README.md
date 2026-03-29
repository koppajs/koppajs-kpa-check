<a id="readme-top"></a>

<div align="center">
  <img src="https://public-assets-1b57ca06-687a-4142-a525-0635f7649a5c.s3.eu-central-1.amazonaws.com/koppajs/koppajs-logo-text-900x226.png" width="500" alt="KoppaJS Logo">
</div>

<br>

<div align="center">
  <a href="https://www.npmjs.com/package/@koppajs/koppajs-kpa-check"><img src="https://img.shields.io/npm/v/@koppajs/koppajs-kpa-check?style=flat-square" alt="npm version"></a>
  <a href="https://github.com/koppajs/koppajs-kpa-check/actions"><img src="https://img.shields.io/github/actions/workflow/status/koppajs/koppajs-kpa-check/ci.yml?branch=main&style=flat-square" alt="CI Status"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-Apache--2.0-blue?style=flat-square" alt="License"></a>
</div>

<br>

<div align="center">
  <h1 align="center">@koppajs/koppajs-kpa-check</h1>
  <h3 align="center">CLI diagnostics runner for KoppaJS .kpa files</h3>
  <p align="center">
    <i>Deterministic command-line diagnostics powered by the shared KoppaJS language layer.</i>
  </p>
</div>

<br>

<div align="center">
  <p align="center">
    <a href="https://github.com/koppajs/koppajs-documentation">Documentation</a>
    &middot;
    <a href="https://github.com/koppajs/koppajs-language-core">Language Core</a>
    &middot;
    <a href="https://github.com/koppajs/koppajs-language-server">Language Server</a>
    &middot;
    <a href="https://github.com/koppajs/koppajs-vscode-extension">VS Code Extension</a>
    &middot;
    <a href="https://github.com/koppajs/koppajs-kpa-check/issues">Issues</a>
  </p>
</div>

<br>

<details>
<summary>Table of Contents</summary>
  <ol>
    <li><a href="#purpose">Purpose</a></li>
    <li><a href="#repository-classification">Repository Classification</a></li>
    <li><a href="#ownership-boundaries">Ownership Boundaries</a></li>
    <li><a href="#public-contract">Public Contract</a></li>
    <li><a href="#installation">Installation</a></li>
    <li><a href="#requirements">Requirements</a></li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#json-output">JSON Output</a></li>
    <li><a href="#exit-codes">Exit Codes</a></li>
    <li><a href="#ecosystem-fit">Ecosystem Fit</a></li>
    <li><a href="#quality-baseline">Quality Baseline</a></li>
    <li><a href="#release-model">Release Model</a></li>
    <li><a href="#architecture-governance">Architecture & Governance</a></li>
    <li><a href="#community-contribution">Community & Contribution</a></li>
    <li><a href="#license">License</a></li>
  </ol>
</details>

---

## Purpose

This repository exists to do one job well:

- accept explicit file and directory targets for `.kpa` analysis
- collect shared KoppaJS diagnostics outside editor or language-server hosts
- print stable, grep-friendly warning lines and explicit exit codes
- keep the CLI surface thin so language semantics continue to live in
  `@koppajs/koppajs-language-core`

It is not a parser fork, a formatter, or a replacement for the language server.

---

## Repository Classification

- Repo type: CLI diagnostics package
- Runtime responsibility: filesystem target resolution, workspace-graph
  orchestration, output formatting, and process exit-code selection
- Build-time responsibility: compile the TypeScript package, emit declarations,
  and validate the repository quality gates
- UI surface: none
- Maturity level: `v0` stabilization

---

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

---

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

---

## Core Compatibility

This release line validates against:

- `@koppajs/koppajs-language-core: ^0.1.4`

The effective compatibility contract is the dependency range in
`package.json`. The maintenance policy lives in
[`docs/meta/version-compatibility.md`](./docs/meta/version-compatibility.md).

---

## Installation

Install the package into a workspace that should run local `.kpa` diagnostics:

```bash
npm install --save-dev @koppajs/koppajs-kpa-check
```

Run it without adding a custom wrapper:

```bash
npx kpa-check src
```

---

## Requirements

For package consumers:

- Node.js >= 22

For local repository work:

- Node.js >= 22
- npm >= 10
- pnpm >= 9 (supported local alternative)

The maintainer default remains pinned to Node 22 through `.nvmrc`.

---

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

---

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

---

## Exit Codes

- `0`: all reachable `.kpa` files were checked and no diagnostics were found,
  or no `.kpa` files were reachable, or `--help` / `--version` completed
- `1`: at least one diagnostic was emitted
- `2`: the invocation itself was invalid, currently because at least one target
  path does not exist or an unknown/conflicting CLI option was provided

---

## Ecosystem Fit

`@koppajs/koppajs-kpa-check` complements the rest of the KoppaJS language toolchain:

- `@koppajs/koppajs-language-core` owns parsing, indexing, and diagnostics
- `@koppajs/koppajs-language-server` exposes the same language layer through LSP
- editor integrations can use the language server for interactive workflows
- `@koppajs/koppajs-kpa-check` remains the narrow non-editor entry point for CI,
  scripts, and local validation

The package intentionally stays thin so diagnostics behavior evolves in one
place.

---

## Quality Baseline

The enforced repository checks are:

- `npm run check:docs`
- `npm run check:meta`
- `npm run format:check`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run test:dist`
- `npm run check`
- `npm run validate`

The release candidate should also pass:

- `npm run release:check`

GitHub Actions runs `npm run validate` on Node.js 22 and 24 for pushes to
`main` and `develop` and for pull requests. The same CI workflow also runs
`pnpm run validate` on Node.js 22 and 24. Tagged releases rerun
`npm run validate` and `npm run release:check` on the maintainer default from
`.nvmrc` before publish.

`npm run check:docs` includes both the governed root-document contract and a
semantic consistency check that keeps version, workflow, and quality-gate claims
aligned with the actual repository state.

---

## Release Model

Releases are manual and tag-driven through GitHub Actions.

- `package.json` defines the intended release version
- `CHANGELOG.md` records the release notes
- `RELEASE.md` defines the repository-specific release workflow
- `.github/workflows/release.yml` validates and publishes tagged releases

---

## Architecture & Governance

Project intent, contributor rules, and documentation contracts live in the local repo meta layer:

- [AI_CONSTITUTION.md](./AI_CONSTITUTION.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [DECISION_HIERARCHY.md](./DECISION_HIERARCHY.md)
- [DEVELOPMENT_RULES.md](./DEVELOPMENT_RULES.md)
- [TESTING_STRATEGY.md](./TESTING_STRATEGY.md)
- [RELEASE.md](./RELEASE.md)
- [ROADMAP.md](./ROADMAP.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [CONTRIBUTING.md](./CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)
- [docs/specs/README.md](./docs/specs/README.md)
- [docs/specs/repository-documentation-contract.md](./docs/specs/repository-documentation-contract.md)
- [docs/architecture/README.md](./docs/architecture/README.md)
- [docs/meta/README.md](./docs/meta/README.md)
- [docs/meta/repository-map.md](./docs/meta/repository-map.md)
- [docs/quality/README.md](./docs/quality/README.md)
- [docs/quality/validation-baseline.md](./docs/quality/validation-baseline.md)
- [.github/workflows/README.md](./.github/workflows/README.md)

The file-shape contract for `README.md`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, and `CONTRIBUTING.md` is defined in [docs/specs/repository-documentation-contract.md](./docs/specs/repository-documentation-contract.md).

Run the local document guard before committing:

```bash
npm run check:docs
```

---

## Community & Contribution

Issues and pull requests are welcome:

https://github.com/koppajs/koppajs-kpa-check/issues

Contributor workflow details live in [CONTRIBUTING.md](./CONTRIBUTING.md).

Community expectations live in [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md).

---

## License

Apache License 2.0 — © 2026 KoppaJS, Bastian Bensch
