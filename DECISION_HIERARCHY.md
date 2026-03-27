# Decision Hierarchy

When documents or examples disagree, use this order of precedence.

## Precedence Order

1. Accepted specs in `docs/specs/`
2. Accepted ADRs in `docs/adr/`
3. Root system documents: `AI_CONSTITUTION.md`, `ARCHITECTURE.md`
4. Root execution rules: `DEVELOPMENT_RULES.md`, `TESTING_STRATEGY.md`
5. Supporting docs in `docs/meta/`, `docs/architecture/`, and `docs/quality/`
6. Contributor and usage docs: `CONTRIBUTING.md`, `README.md`
7. Inline comments, examples, and historical behavior not captured elsewhere

## Conflict Resolution

1. Identify the highest-precedence document that governs the issue.
2. Align code and lower-precedence documents to that source.
3. If no governing source exists, add the missing spec or ADR instead of
   improvising.
4. If the conflict exposes a new durable design choice, record it in an ADR.

## Maintenance Rule

No change is complete if the highest-precedence document for that behavior is
left outdated.
