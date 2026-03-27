# Specifications

Specs define intended behavior and are the highest-level behavior documents in
this repository.

## When To Add Or Update A Spec

- the CLI contract changes
- exit-code behavior changes
- the root package export gains or changes supported behavior
- target resolution or output formatting changes

## Required Sections

- `status`
- `description`
- `behavior`
- `inputs`
- `outputs`
- `constraints`
- `edge_cases`
- `acceptance_criteria`
- `evolution_phase`
- `completeness_level`
- `known_gaps`
- `deferred_complexity`
- `technical_debt_items`
- `change_management`

Use [SPEC_TEMPLATE.md](./SPEC_TEMPLATE.md) for new specs.
