# Meta Layer Guide

## Purpose

The meta layer is the repository memory for architecture, quality gates, and
contract decisions.

## Reading Order

1. [../../DECISION_HIERARCHY.md](../../DECISION_HIERARCHY.md)
2. [../../AI_CONSTITUTION.md](../../AI_CONSTITUTION.md)
3. [../../ARCHITECTURE.md](../../ARCHITECTURE.md)
4. [../../RELEASE.md](../../RELEASE.md)
5. [../../DEVELOPMENT_RULES.md](../../DEVELOPMENT_RULES.md)
6. [../../TESTING_STRATEGY.md](../../TESTING_STRATEGY.md)
7. [../architecture/README.md](../architecture/README.md)
8. [../quality/README.md](../quality/README.md)
9. [../specs/README.md](../specs/README.md)
10. [../adr/README.md](../adr/README.md)

## What Lives Where

- Root documents define repository-wide rules.
- `RELEASE.md` and `CHANGELOG.md` define the release history and release flow.
- `docs/architecture/` describes structure and boundaries.
- `docs/adr/` records durable technical decisions.
- `docs/specs/` defines behavior contracts.
- `docs/quality/` explains verification and tool choices.

## Maintenance Rule

Update the relevant meta-layer document in the same change as the code or
workflow it governs.
