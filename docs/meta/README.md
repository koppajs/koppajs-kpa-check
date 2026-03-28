# Meta Layer Guide

The meta layer is the repository's architecture memory and decision framework.
It exists to keep implementation, docs, and collaboration rules aligned.

## Contents

- root governance docs define the top-level rules for architecture,
  development, testing, release, and decision precedence
- [`repository-map.md`](./repository-map.md) describes the current top-level
  repository responsibilities
- `docs/architecture/` stores deeper structure and dependency-boundary detail
- `docs/adr/` stores architectural decisions and their rationale
- `docs/specs/` stores the package's client-visible contract
- `docs/quality/` stores quality gates and verification procedures
- [`../../.github/workflows/README.md`](../../.github/workflows/README.md)
  records the hosted CI and release workflow baseline
- [`tooling-baseline.md`](./tooling-baseline.md) records the active tooling
  baseline and deliberate exclusions
- [`version-compatibility.md`](./version-compatibility.md) defines how this
  package tracks compatible `@koppajs/koppajs-language-core` versions
- [`maintenance.md`](./maintenance.md) defines how the meta layer evolves with
  the codebase

## Update Matrix

| Change type | Required meta-layer updates |
| ----------- | --------------------------- |
| Public behavior or package contract change | Update the relevant spec, tests, and affected root docs |
| Module boundary or repository-shape change | Update `ARCHITECTURE.md`, `docs/architecture/`, and [repository-map.md](./repository-map.md) |
| New quality gate, engine policy, or release-validation rule | Update `TESTING_STRATEGY.md`, `docs/quality/`, [../../.github/workflows/README.md](../../.github/workflows/README.md), and `RELEASE.md` |
| New contributor workflow expectation | Update `CONTRIBUTING.md`, `DEVELOPMENT_RULES.md`, and any affected hooks or scripts |

## Operating Rule

If the system changes, the meta layer changes in the same pull request. Drift is
a defect.
