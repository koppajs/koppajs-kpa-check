# Meta Layer Maintenance

## Continuous Update Rule

Whenever architecture, modules, workflows, or client-visible behavior change,
update the meta layer in the same change.

## Update Matrix

| Change                                 | Required Meta-Layer Updates                                                                                |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| New module boundary                    | `ARCHITECTURE.md`, `docs/architecture/module-boundaries.md`, ADR                                           |
| New coding pattern or repo rule        | `DEVELOPMENT_RULES.md`                                                                                     |
| New or changed CLI behavior            | relevant spec in `docs/specs/`, `README.md`, tests                                                        |
| New build, lint, test, or release flow | `CONTRIBUTING.md`, `TESTING_STRATEGY.md`, `docs/quality/quality-gates.md`, `docs/quality/validation-baseline.md`, `docs/meta/tooling-baseline.md`, `.github/workflows/README.md`, `RELEASE.md` |
| Supported core-range change            | `README.md`, `RELEASE.md`, `docs/meta/version-compatibility.md`, `CHANGELOG.md`                           |
| AI workflow change                     | `AI_CONSTITUTION.md`                                                                                       |

## Periodic Audit Procedure

1. Compare repository structure with `ARCHITECTURE.md`.
2. Compare runtime behavior with active specs.
3. Check for docs that describe tools or scripts not present in `package.json`.
4. Compare the release docs with the actual `.github/workflows/` files.
5. Compare `docs/meta/repository-map.md` with the actual top-level repository shape.
6. Record new structural decisions as ADRs.
7. Add roadmap items for known gaps that are not fixed immediately.

## Definition of Drift

Documentation drift exists when:

- a doc references tools, workflows, or scripts that are not part of this repo,
- a module boundary in docs does not match actual imports or responsibilities,
- a client-visible behavior is not described by a spec,
- the release process in docs does not match `.github/workflows/release.yml`,
- or a major decision exists only in code or chat history.

Drift should be fixed before new unrelated work is merged.
