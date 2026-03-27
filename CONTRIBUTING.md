# Contributing

## Scope

Contributions should keep `@koppajs/koppajs-kpa-check` a narrow diagnostics runner.
Language semantics belong in `@koppajs/koppajs-language-core`; this repository should
only change when the CLI contract, package surface, or repository quality
baseline needs to change.

## Local Prerequisites

- Node.js `>=20`
- npm

## Local Workflow

1. Install dependencies with `npm install`.
2. Make the smallest change that solves the actual problem.
3. Update the relevant spec or architecture doc if behavior or boundaries move.
4. Run `npm run check`.
5. Keep unrelated edits out of the same change.

## Change Rules

- Behavior changes require an update to `docs/specs/`.
- Architectural boundary changes require updates to `ARCHITECTURE.md` and
  `docs/architecture/`.
- Lasting technical choices require an ADR in `docs/adr/`.
- Quality-gate changes require updates to `TESTING_STRATEGY.md` and
  `docs/quality/`.
- Public contract changes must be reflected in `README.md`.

## Testing Expectation

Every user-visible fix or behavior change needs a real test unless the current
architecture makes that impossible. In that case, document the gap explicitly
in the change.

## Pull Request Expectation

A complete change should leave these aligned:

- code and package metadata
- specs and architecture docs
- tests and quality scripts
- README and contributor guidance
