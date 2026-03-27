# Tooling Baseline

## Chosen Tools

- TypeScript
  Source language, typechecking, and package build.
- Vitest
  Fast TypeScript-friendly runner for unit and lightweight integration tests.
- ESLint
  Small static rule layer for source and repository scripts.
- Custom Node.js scripts in `scripts/`
  Meta-layer and formatting checks without adding broader formatting tooling.

## Why This Baseline

- The repository is small enough that heavy formatting or browser tooling would
  add more maintenance than value.
- Vitest keeps tests close to the TypeScript sources without a separate build
  step.
- ESLint provides a narrow static layer beyond TypeScript without widening the
  package runtime.
- The formatting script enforces only the text hygiene rules this repository
  actually needs today.

## Intentionally Not Included

- Prettier: not required for the current repository size or formatting needs.
- Playwright: no supported UI surface exists in this repository.
- Coverage thresholds: scenario coverage matters more than a numeric gate here.
