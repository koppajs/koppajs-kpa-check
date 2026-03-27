# Roadmap

## Current State

The repository is in `v0` stabilization. The current priority is to keep the
diagnostics runner explicit, dependable, and narrowly scoped while the KoppaJS
language toolchain settles.

## Near-Term Work

- keep the CLI contract stable while real consumer usage clarifies whether new
  flags are necessary
- expand tests only where observed behavior or regressions justify more
  coverage

## Deferred Work

- alternative output formats beyond the default JSON mode
- configuration files or ignore-pattern support
- richer severity handling if `@koppajs/koppajs-language-core` exposes a stable need
  for it

These remain deferred until real usage proves the added surface is worth the
maintenance cost.
