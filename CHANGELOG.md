# Changelog

All notable changes to `@koppajs/koppajs-kpa-check` are recorded here.

## [0.1.0]

- Establish the initial published CLI package boundary for deterministic `.kpa`
  diagnostics runs through `kpa-check` and `runKpaCheck()`.
- Align the package, documentation, and local development flow with
  `@koppajs/koppajs-language-core` as the shared KoppaJS language dependency.
- Add `--help`, `--version`, and `--json` so the release surface is usable for
  both humans and automation.
- Lock the public package surface, package metadata, and manual release model
  with explicit tests and repository documentation.
