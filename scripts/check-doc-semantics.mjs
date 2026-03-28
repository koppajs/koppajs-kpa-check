import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(message);
  failed = true;
}

function expectIncludes(relativePath, content, snippet) {
  if (!content.includes(snippet)) {
    fail(`Semantic doc check failed in ${relativePath}: missing -> ${snippet}`);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

let failed = false;

const packageManifest = JSON.parse(read('package.json'));
const readme = read('README.md');
const contributing = read('CONTRIBUTING.md');
const release = read('RELEASE.md');
const testingStrategy = read('TESTING_STRATEGY.md');
const toolingBaseline = read('docs/meta/tooling-baseline.md');
const qualityReadme = read('docs/quality/README.md');
const qualityGates = read('docs/quality/quality-gates.md');
const validationBaseline = read('docs/quality/validation-baseline.md');
const workflowReadme = read('.github/workflows/README.md');
const specsReadme = read('docs/specs/README.md');
const ciWorkflow = read('.github/workflows/ci.yml');
const releaseWorkflow = read('.github/workflows/release.yml');
const nvmrc = read('.nvmrc').trim();
const npmrc = read('.npmrc').trim();

const requiredScripts = [
  'check:docs',
  'check:docs:contract',
  'check:docs:semantics',
  'check:meta',
  'format:check',
  'lint',
  'typecheck',
  'test',
  'build',
  'check',
  'validate',
  'release:check',
];

for (const scriptName of requiredScripts) {
  if (!packageManifest.scripts?.[scriptName]) {
    fail(`package.json is missing required script: ${scriptName}`);
  }
}

if (
  !packageManifest.scripts['check:docs']?.includes('check:docs:contract') ||
  !packageManifest.scripts['check:docs']?.includes('check:docs:semantics')
) {
  fail(
    'package.json check:docs script must chain both structural and semantic documentation checks.',
  );
}

if (packageManifest.engines?.node !== '>=22') {
  fail('package.json must declare Node.js >=22.');
}

if (packageManifest.engines?.npm !== '>=10') {
  fail('package.json must declare npm >=10.');
}

if (nvmrc !== '22') {
  fail('.nvmrc must keep the maintainer default on Node.js 22.');
}

if (!npmrc.includes('engine-strict=true')) {
  fail('.npmrc must enforce engine-strict=true.');
}

expectIncludes('README.md', readme, 'Node.js >= 22');
expectIncludes('README.md', readme, 'npm >= 10');
expectIncludes(
  'README.md',
  readme,
  'npm install --save-dev @koppajs/koppajs-kpa-check',
);
expectIncludes('README.md', readme, 'npx kpa-check src');
expectIncludes('README.md', readme, 'Node.js 22 and 24');
for (const scriptName of [
  'check:docs',
  'check:meta',
  'format:check',
  'lint',
  'typecheck',
  'test',
  'check',
  'build',
  'validate',
  'release:check',
]) {
  expectIncludes('README.md', readme, `npm run ${scriptName}`);
}

expectIncludes('CONTRIBUTING.md', contributing, 'Node.js >= 22');
expectIncludes('CONTRIBUTING.md', contributing, 'npm >= 10');
expectIncludes(
  'CONTRIBUTING.md',
  contributing,
  'The tracked `.npmrc` enforces compatible Node.js and npm versions during install.',
);
for (const scriptName of [
  'check:docs',
  'check:meta',
  'format:check',
  'lint',
  'typecheck',
  'test',
  'check',
  'validate',
  'release:check',
]) {
  expectIncludes('CONTRIBUTING.md', contributing, `npm run ${scriptName}`);
}

expectIncludes('RELEASE.md', release, 'Node.js >= 22');
expectIncludes('RELEASE.md', release, 'npm 10 or newer');
expectIncludes(
  'RELEASE.md',
  release,
  'This repository enforces `engine-strict=true` through the tracked `.npmrc`',
);
expectIncludes('RELEASE.md', release, 'maintainer default from `.nvmrc`');
expectIncludes('RELEASE.md', release, 'npm run validate');
expectIncludes('RELEASE.md', release, 'npm run release:check');

expectIncludes(
  'TESTING_STRATEGY.md',
  testingStrategy,
  '`npm run check:docs` combines the structural documentation contract and semantic repository checks.',
);
expectIncludes(
  'TESTING_STRATEGY.md',
  testingStrategy,
  'GitHub Actions CI runs `npm run validate` on Node.js 22 and 24.',
);
expectIncludes(
  'TESTING_STRATEGY.md',
  testingStrategy,
  'The release workflow reruns `npm run validate` and `npm run release:check` on the maintainer default from `.nvmrc` before publish.',
);

expectIncludes('docs/meta/tooling-baseline.md', toolingBaseline, '.npmrc');
expectIncludes('docs/meta/tooling-baseline.md', toolingBaseline, 'engine-strict=true');
expectIncludes('docs/meta/tooling-baseline.md', toolingBaseline, 'Husky');
expectIncludes('docs/meta/tooling-baseline.md', toolingBaseline, 'Node.js 22 and 24');

for (const snippet of [
  'validation-baseline.md',
  '../../.github/workflows/README.md',
  'npm run check:docs',
  'npm run validate',
  'npm run release:check',
]) {
  expectIncludes('docs/quality/README.md', qualityReadme, snippet);
}

expectIncludes(
  'docs/quality/quality-gates.md',
  qualityGates,
  '`npm run check:docs`: structural and semantic documentation validation.',
);
expectIncludes(
  'docs/quality/quality-gates.md',
  qualityGates,
  'Node.js 22 and 24',
);

expectIncludes(
  'docs/quality/validation-baseline.md',
  validationBaseline,
  'Node.js 22 and 24',
);
expectIncludes(
  'docs/quality/validation-baseline.md',
  validationBaseline,
  'engine-strict=true',
);
expectIncludes(
  'docs/quality/validation-baseline.md',
  validationBaseline,
  'npm run release:check',
);

expectIncludes(
  '.github/workflows/README.md',
  workflowReadme,
  'Node.js 22 and 24',
);
expectIncludes('.github/workflows/README.md', workflowReadme, 'npm run validate');
expectIncludes('.github/workflows/README.md', workflowReadme, 'npm run release:check');

if (!/node-version:\s*\$\{\{\s*matrix\.node-version\s*\}\}/.test(ciWorkflow)) {
  fail('.github/workflows/ci.yml no longer uses the documented Node.js test matrix.');
}

for (const version of ['22', '24']) {
  if (!new RegExp(`-\\s+${escapeRegExp(version)}`).test(ciWorkflow)) {
    fail(`.github/workflows/ci.yml is missing Node.js ${version} in the test matrix.`);
  }
}

expectIncludes('.github/workflows/release.yml', releaseWorkflow, "node-version-file: '.nvmrc'");
expectIncludes('.github/workflows/release.yml', releaseWorkflow, 'npm run validate');
expectIncludes('.github/workflows/release.yml', releaseWorkflow, 'npm run release:check');

const specFiles = readdirSync(path.join(root, 'docs/specs'))
  .filter((fileName) => fileName.endsWith('.md') && fileName !== 'README.md')
  .sort();

for (const specFile of specFiles) {
  expectIncludes('docs/specs/README.md', specsReadme, `\`${specFile}\``);
}

if (failed) {
  process.exit(1);
}

console.log('Documentation semantics check passed.');
