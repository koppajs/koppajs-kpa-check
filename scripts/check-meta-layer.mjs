import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const requiredDirectories = [
  '.github',
  '.github/workflows',
  'docs',
  'docs/adr',
  'docs/architecture',
  'docs/meta',
  'docs/quality',
  'docs/specs',
  'scripts',
];

const requiredPaths = [
  '.github/workflows/ci.yml',
  '.github/workflows/release.yml',
  '.github/workflows/README.md',
  '.npmrc',
  '.nvmrc',
  'AI_CONSTITUTION.md',
  'ARCHITECTURE.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'DECISION_HIERARCHY.md',
  'DEVELOPMENT_RULES.md',
  'RELEASE.md',
  'ROADMAP.md',
  'TESTING_STRATEGY.md',
  'docs/adr/README.md',
  'docs/architecture/module-boundaries.md',
  'docs/architecture/README.md',
  'docs/meta/maintenance.md',
  'docs/meta/README.md',
  'docs/meta/repository-map.md',
  'docs/meta/tooling-baseline.md',
  'docs/meta/version-compatibility.md',
  'docs/quality/README.md',
  'docs/quality/quality-gates.md',
  'docs/quality/validation-baseline.md',
  'docs/specs/README.md',
  'docs/specs/SPEC_TEMPLATE.md',
  'docs/specs/diagnostics-runner-contract.md',
  'scripts/check-doc-semantics.mjs',
];

const missingDirectories = requiredDirectories.filter((relativePath) => {
  const absolutePath = path.join(rootDirectory, relativePath);

  return !fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isDirectory();
});
const missingPaths = requiredPaths.filter(
  (relativePath) => !fs.existsSync(path.join(rootDirectory, relativePath)),
);

if (missingDirectories.length > 0 || missingPaths.length > 0) {
  console.error('kpa-check meta layer ist unvollstaendig. Fehlende Pfade:');

  for (const missingDirectory of missingDirectories) {
    console.error(`- ${missingDirectory}/`);
  }

  for (const missingPath of missingPaths) {
    console.error(`- ${missingPath}`);
  }

  process.exitCode = 1;
} else {
  console.log('kpa-check meta layer vorhanden.');
}
