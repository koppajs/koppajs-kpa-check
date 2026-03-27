# Change Log

All notable changes to **@koppajs/koppajs-kpa-check** are documented in this file.

This project uses a **manual, tag-driven release process**.
Only tagged versions represent official releases.

This changelog documents **intentional milestones and guarantees**,
not every internal refactor.

---

## [Unreleased]
This section is intentionally empty.

## [0.1.1]

- Add the governed repository documentation contract, local `check:docs`
  validation, and the matching Husky pre-commit hook for required root docs.
- Align the published package with Node ESM expectations and validate the
  supported `@koppajs/koppajs-language-core` range at `^0.1.3`.
- Expand the root governance and contributor documents to match the current
  KoppaJS repository standards for branding and repository guidance.
---
## [0.1.0]

- Establish the initial published CLI package boundary for deterministic `.kpa`
  diagnostics runs through `kpa-check` and `runKpaCheck()`.
- Align the package, documentation, and local development flow with
  `@koppajs/koppajs-language-core` as the shared KoppaJS language dependency.
- Add `--help`, `--version`, and `--json` so the release surface is usable for
  both humans and automation.
- Lock the public package surface, package metadata, and manual release model
  with explicit tests and repository documentation.
