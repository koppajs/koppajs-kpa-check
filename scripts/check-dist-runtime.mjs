import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
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

console.log('Dist runtime smoke test passed.');
