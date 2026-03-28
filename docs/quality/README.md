# Quality Guide

This directory captures the repository's practical quality gates and the lean
tooling choices that support them.

## Documents In This Area

- [quality-gates.md](./quality-gates.md): practical repository checks and hosted
  automation expectations
- [validation-baseline.md](./validation-baseline.md): enforced checks and active
  CI/release baseline
- [../meta/tooling-baseline.md](../meta/tooling-baseline.md): active tooling and
  engine-enforcement policy
- [../../TESTING_STRATEGY.md](../../TESTING_STRATEGY.md): root testing strategy
- [../../.github/workflows/README.md](../../.github/workflows/README.md): hosted
  workflow overview

## Verification Matrix

- Documentation contract: `npm run check:docs`
- Meta-layer integrity: `npm run check:meta`
- Formatting: `npm run format:check`
- Static analysis: `npm run lint`
- Type safety: `npm run typecheck`
- Test suite: `npm test`
- Build output: `npm run build`
- Dist runtime smoke test: `npm run test:dist`
- Main local gate: `npm run check`
- Full repository validation: `npm run validate`
- Release payload check: `npm run release:check`
- Hosted workflow overview: [../../.github/workflows/README.md](../../.github/workflows/README.md)

## Maintenance Rule

Update this directory whenever quality gates, CI expectations, release
validation, or tooling choices change.
