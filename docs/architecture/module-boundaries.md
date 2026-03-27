# Module Boundaries

## Runtime Modules

- `src/cli.ts`
  - may depend on `src/index.ts`
  - must not contain runner logic
- `src/index.ts`
  - may re-export the supported programmatic API
  - must not execute the runner at import time
- `src/runner.ts`
  - may depend on Node built-ins and `@koppajs/koppajs-language-core`
  - owns CLI behavior but not process startup

## Test Modules

- `src/test/unit/*`
  - may depend on `src/runner.ts`
  - may use real temporary directories and the real language-core workspace
    graph

## Repository Scripts

- `scripts/*`
  - may depend on Node built-ins only
  - must not become runtime dependencies of the published package

## Documentation Boundary

- Docs describe the runtime contract and quality rules.
- Docs must not invent behavior that is absent from the code.
- Code changes that move a boundary must update this document in the same work.
