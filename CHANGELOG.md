# Change Log

All notable changes to **@koppajs/koppajs-kpa-check** are documented in this file.

This project uses a **manual, tag-driven release process**.
Only tagged versions represent official releases.

This changelog documents **intentional milestones and guarantees**,
not every internal refactor.

---

## [Unreleased]

This section is intentionally empty.

## [0.1.3]

- Refresh `package-lock.json` with npm 11 so the Node 24 npm CI path can run
  `npm ci` without lockfile drift failures.
- Add dual-manager CI validation for npm and pnpm on Node 22 and 24 while
  keeping the tagged release workflow npm-based.
- Restore pnpm as a supported local contributor workflow and document how to
  resync the npm lockfile before release with `npm run lock:sync:npm`.

## [0.1.2]

- Fix the published ESM runtime by resolving `package.json` without `__dirname`
  and add a post-build `dist` smoke test to `validate`.
- Raise the minimum supported Node.js version to `>= 22`, keep the maintainer
  default on Node 22, and expand CI validation to Node 22 and Node 24.
- Add semantic documentation checks, tracked engine enforcement, workflow
  documentation, and real `@koppajs/koppajs-language-core` CLI regression
  coverage to keep the repository aligned with the KoppaJS package baseline.

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
