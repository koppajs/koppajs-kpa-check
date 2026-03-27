# Release Process for `@koppajs/koppajs-kpa-check`

This document describes the repository-specific release workflow for
`@koppajs/koppajs-kpa-check`.

The project uses a manual, versioned release process.
Only the contents explicitly prepared for a release should be published.

## Release Model

This repository does not use automated versioning tools such as Changesets or
semantic-release.

The release is controlled by:

- the version in `package.json`
- the release notes in `CHANGELOG.md`
- the validated package payload
- the manual `npm publish` step when a release is intended

## Preconditions

Before publishing a release, ensure all of the following are true:

- `package.json.name` is exactly `@koppajs/koppajs-kpa-check`
- `package.json` contains the target version
- `CHANGELOG.md` contains the corresponding release notes
- `package-lock.json` is up to date
- the repository baseline passes locally

Tooling expectations for local verification:

- Node.js 20 or newer
- npm 10 or newer

## Local Validation Before Publish

Validate the exact release candidate locally:

```bash
npm install
npm run validate
npm pack --dry-run
```

Why this matters:

- `prepack` re-runs the repository validation gate
- failing locally is cheaper than publishing a broken package
- `npm pack --dry-run` verifies the publishable package payload

The published package contents are controlled by the `files` field in
`package.json`. The intended publish payload is:

- `dist`
- `README.md`
- `CHANGELOG.md`
- `LICENSE`

## Step-by-Step Release Workflow

1. Finalize the release content on the working branch.
2. Update `package.json` to the release version.
3. Add the matching notes to `CHANGELOG.md`.
4. Run the local validation commands.
5. Build and inspect the package payload with `npm pack --dry-run`.
6. Publish the validated package with `npm publish` when the release is
   approved.

## Rules

- Do not publish without a matching `CHANGELOG.md` entry.
- Do not publish if `npm run validate` fails.
- Do not widen the `files` payload without updating tests and documentation.
- Keep the published package scoped as `@koppajs/koppajs-kpa-check`.
