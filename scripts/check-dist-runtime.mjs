import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runKpaCheck } from '../dist/index.js';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const packageManifest = JSON.parse(
  readFileSync(path.join(repositoryRoot, 'package.json'), 'utf8'),
);
const stdout = [];
const stderr = [];

const exitCode = runKpaCheck(['--version'], {
  cwd: repositoryRoot,
  io: {
    error(message) {
      stderr.push(message);
    },
    log(message) {
      stdout.push(message);
    },
  },
});

assert.equal(exitCode, 0);
assert.deepEqual(stdout, [packageManifest.version]);
assert.deepEqual(stderr, []);

const cliResult = spawnSync(process.execPath, [path.join(repositoryRoot, 'dist/cli.js'), '--version'], {
  cwd: repositoryRoot,
  encoding: 'utf8',
});

assert.equal(cliResult.error, undefined);
assert.equal(cliResult.status, 0, cliResult.stderr || cliResult.stdout);
assert.equal(cliResult.stdout.trim(), packageManifest.version);
assert.equal(cliResult.stderr.trim(), '');

const fixtureRoot = mkdtempSync(path.join(os.tmpdir(), 'kpa-check-core-patch-'));

function checkFixture(componentScript, template, pageScript, expectedCodes) {
  writeFileSync(path.join(fixtureRoot, 'Card.kpa'), [
    '[template]<div></div>[/template]',
    '[ts]', componentScript, '[/ts]', '',
  ].join('\n'));
  writeFileSync(path.join(fixtureRoot, 'Page.kpa'), [
    '[template]', template, '[/template]',
    '[ts]', "import Card from './Card.kpa';", pageScript, '[/ts]', '',
  ].join('\n'));

  const result = spawnSync(process.execPath, [path.join(repositoryRoot, 'dist/cli.js'), '--json', '.'], {
    cwd: fixtureRoot,
    encoding: 'utf8',
  });
  assert.equal(result.error, undefined);
  assert.equal(result.stderr, '');
  assert.equal(result.status, expectedCodes.length > 0 ? 1 : 0, result.stdout);
  const report = JSON.parse(result.stdout);
  assert.deepEqual(report.diagnostics.map((diagnostic) => diagnostic.code), expectedCodes);
  assert.equal(report.summary.checkedFileCount, 2);
  assert.equal(report.summary.diagnosticCount, expectedCodes.length);
  for (const diagnostic of report.diagnostics) {
    assert.equal(diagnostic.relativeFilePath, 'Page.kpa');
  }
}

try {
  // Empty closing tags must not be mistaken for required default-slot content.
  for (const template of ['<Card></Card>', '<Card>  \n  </Card>', '<Card />']) {
    checkFixture('interface Slots { default: unknown; }', template, '', ['kpa.missing-component-slot']);
  }
  for (const template of ['<Card>Body</Card>', '<Card><div>Body</div></Card>']) {
    checkFixture('interface Slots { default: unknown; }', template, '', []);
  }

  // Unrelated script and unresolved-import errors must not reject a valid prop.
  const pageScript = [
    "import unresolved from './unresolved';",
    'const unrelated: string = 123;',
    'const count = 1;',
  ].join('\n');
  checkFixture('interface Props { count: number; }', '<Card count={count} />', pageScript, []);
  checkFixture('interface Props { count: number; }', '<Card count={"wrong"} />', pageScript,
    ['kpa.invalid-component-prop-type']);
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}

console.log('Dist runtime smoke test and core 0.2.1 CLI regressions passed.');
