import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, expect, it } from 'vitest';
import {
  formatDiagnostic,
  resolveCliTargets,
  runKpaCheck,
  type KpaCheckIo,
  type KpaCheckWorkspaceGraph,
} from '../../runner';

function createCapturedIo(): {
  io: KpaCheckIo;
  stderr: string[];
  stdout: string[];
} {
  const stdout: string[] = [];
  const stderr: string[] = [];

  return {
    io: {
      error(message) {
        stderr.push(message);
      },
      log(message) {
        stdout.push(message);
      },
    },
    stderr,
    stdout,
  };
}

describe('resolveCliTargets', () => {
  it('defaults to the current working directory when no targets are passed', () => {
    const result = resolveCliTargets([], {
      cwd: '/workspace/project',
      fileExists: () => true,
    });

    expect(result).toEqual({
      status: 'ok',
      targets: ['/workspace/project'],
    });
  });

  it('fails when at least one requested target does not exist', () => {
    const result = resolveCliTargets(['existing.kpa', 'missing.kpa'], {
      cwd: '/workspace/project',
      fileExists(targetPath) {
        return targetPath.endsWith('existing.kpa');
      },
    });

    expect(result).toEqual({
      errorKind: 'missing-targets',
      exitCode: 2,
      message: 'kpa-check hat 1 nicht existierende(s) Ziel(e) erhalten:\n- missing.kpa',
      missingTargets: ['/workspace/project/missing.kpa'],
      status: 'error',
    });
  });

  it('deduplicates identical resolved targets in first-seen order', () => {
    const result = resolveCliTargets(['src', './src', 'Page.kpa', './Page.kpa'], {
      cwd: '/workspace/project',
      fileExists: () => true,
    });

    expect(result).toEqual({
      status: 'ok',
      targets: ['/workspace/project/src', '/workspace/project/Page.kpa'],
    });
  });
});

describe('formatDiagnostic', () => {
  it('formats file paths and positions as 1-based warning output', () => {
    expect(
      formatDiagnostic(
        '/workspace/project/src/Page.kpa',
        {
          message: 'Lokales Template-Symbol [missing] wurde nicht gefunden.',
          range: {
            line: 3,
            startChar: 5,
          },
        },
        '/workspace/project',
      ),
    ).toBe(
      'src/Page.kpa:4:6 warning Lokales Template-Symbol [missing] wurde nicht gefunden.',
    );
  });
});

describe('runKpaCheck', () => {
  it('prints help and exits with code 0 without touching the filesystem', () => {
    const { io, stderr, stdout } = createCapturedIo();

    const exitCode = runKpaCheck(['--help'], {
      createWorkspaceGraph() {
        throw new Error('workspace graph must not be created for --help');
      },
      fileExists() {
        throw new Error('filesystem must not be checked for --help');
      },
      io,
      packageName: '@test/kpa-check',
      version: '9.9.9',
    });

    expect(exitCode).toBe(0);
    expect(stdout).toEqual([
      [
        '@test/kpa-check 9.9.9',
        '',
        'Usage:',
        '  kpa-check [options] [targets...]',
        '',
        'Run KoppaJS diagnostics for .kpa files.',
        '',
        'Options:',
        '  --help    Show this help text and exit.',
        '  --version Print the package version and exit.',
        '  --json    Emit machine-readable JSON output.',
        '',
        'Notes:',
        '  Targets may be files or directories.',
        '  With no targets, kpa-check checks the current working directory.',
      ].join('\n'),
    ]);
    expect(stderr).toEqual([]);
  });

  it('prints the version and exits with code 0', () => {
    const { io, stderr, stdout } = createCapturedIo();

    const exitCode = runKpaCheck(['--version'], {
      io,
      version: '9.9.9',
    });

    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['9.9.9']);
    expect(stderr).toEqual([]);
  });

  it('rejects unknown options with exit code 2', () => {
    const { io, stderr, stdout } = createCapturedIo();

    const exitCode = runKpaCheck(['--bogus'], {
      io,
    });

    expect(exitCode).toBe(2);
    expect(stdout).toEqual([]);
    expect(stderr).toEqual(['kpa-check hat eine unbekannte Option erhalten: --bogus']);
  });

  it('reports missing targets and exits with code 2', () => {
    const { io, stderr, stdout } = createCapturedIo();

    const exitCode = runKpaCheck(['missing.kpa'], {
      cwd: '/workspace/project',
      fileExists: () => false,
      io,
    });

    expect(exitCode).toBe(2);
    expect(stdout).toEqual([]);
    expect(stderr).toEqual([
      'kpa-check hat 1 nicht existierende(s) Ziel(e) erhalten:\n- missing.kpa',
    ]);
  });

  it('emits JSON for missing-target invocation errors', () => {
    const { io, stderr, stdout } = createCapturedIo();

    const exitCode = runKpaCheck(['--json', 'missing.kpa'], {
      cwd: '/workspace/project',
      fileExists: () => false,
      io,
    });

    expect(exitCode).toBe(2);
    expect(stderr).toEqual([]);
    expect(JSON.parse(stdout[0] ?? '')).toEqual({
      cwd: '/workspace/project',
      diagnostics: [],
      errorKind: 'missing-targets',
      exitCode: 2,
      kind: 'check',
      message: 'kpa-check hat 1 nicht existierende(s) Ziel(e) erhalten:\n- missing.kpa',
      missingTargets: ['/workspace/project/missing.kpa'],
      requestedTargets: ['missing.kpa'],
      resolvedTargets: [],
      status: 'error',
      summary: {
        checkedFileCount: 0,
        diagnosticCount: 0,
        targetCount: 1,
      },
    });
  });

  it('reports when no .kpa files are reachable from the requested targets', () => {
    const { io, stderr, stdout } = createCapturedIo();

    const exitCode = runKpaCheck([], {
      createWorkspaceGraph() {
        return {
          collectDiagnosticsForPaths() {
            return [];
          },
          getKpaFilePaths() {
            return [];
          },
        } satisfies KpaCheckWorkspaceGraph;
      },
      cwd: '/workspace/project',
      fileExists: () => true,
      io,
    });

    expect(exitCode).toBe(0);
    expect(stdout).toEqual(['kpa-check hat keine .kpa-Dateien gefunden.']);
    expect(stderr).toEqual([]);
  });

  it('checks the resolved file set instead of dropping directory targets when a file target is also present', () => {
    const { io, stderr, stdout } = createCapturedIo();
    const requestedPaths: string[][] = [];
    const diagnosticsRequests: string[][] = [];

    const exitCode = runKpaCheck(['src', 'Page.kpa'], {
      createWorkspaceGraph(targets) {
        requestedPaths.push([...targets]);

        return {
          collectDiagnosticsForPaths(paths) {
            diagnosticsRequests.push([...paths]);
            return [
              {
                diagnostics: [],
                filePath: '/workspace/project/Page.kpa',
              },
              {
                diagnostics: [],
                filePath: '/workspace/project/src/UserCard.kpa',
              },
            ];
          },
          getKpaFilePaths(paths) {
            requestedPaths.push([...(paths ?? [])].filter((pathValue): pathValue is string => pathValue !== undefined));
            return ['/workspace/project/Page.kpa', '/workspace/project/src/UserCard.kpa'];
          },
        } satisfies KpaCheckWorkspaceGraph;
      },
      cwd: '/workspace/project',
      fileExists: () => true,
      io,
    });

    expect(exitCode).toBe(0);
    expect(requestedPaths).toEqual([
      ['/workspace/project/src', '/workspace/project/Page.kpa'],
      ['/workspace/project/src', '/workspace/project/Page.kpa'],
    ]);
    expect(diagnosticsRequests).toEqual([
      ['/workspace/project/Page.kpa', '/workspace/project/src/UserCard.kpa'],
    ]);
    expect(stdout).toEqual([
      'kpa-check: 2 .kpa-Datei(en) geprueft, keine Diagnostics gefunden.',
    ]);
    expect(stderr).toEqual([]);
  });

  it('prints diagnostics in deterministic line, character, and message order', () => {
    const { io, stderr, stdout } = createCapturedIo();

    const exitCode = runKpaCheck(['Page.kpa'], {
      createWorkspaceGraph() {
        return {
          collectDiagnosticsForPaths() {
            return [
              {
                diagnostics: [
                  {
                    message: 'spaeter',
                    range: {
                      endChar: 2,
                      line: 4,
                      startChar: 1,
                    },
                  },
                  {
                    message: 'alpha',
                    range: {
                      endChar: 4,
                      line: 1,
                      startChar: 3,
                    },
                  },
                  {
                    message: 'beta',
                    range: {
                      endChar: 4,
                      line: 1,
                      startChar: 3,
                    },
                  },
                  {
                    message: 'frueher',
                    range: {
                      endChar: 1,
                      line: 1,
                      startChar: 0,
                    },
                  },
                ],
                filePath: '/workspace/project/Page.kpa',
              },
            ];
          },
          getKpaFilePaths() {
            return ['/workspace/project/Page.kpa'];
          },
        } satisfies KpaCheckWorkspaceGraph;
      },
      cwd: '/workspace/project',
      fileExists: () => true,
      io,
    });

    expect(exitCode).toBe(1);
    expect(stdout).toEqual([
      'Page.kpa:2:1 warning frueher',
      'Page.kpa:2:4 warning alpha',
      'Page.kpa:2:4 warning beta',
      'Page.kpa:5:2 warning spaeter',
    ]);
    expect(stderr).toEqual([
      'kpa-check: 4 Diagnostic(s) in 1 .kpa-Datei(en) gefunden.',
    ]);
  });

  it('emits machine-readable JSON diagnostics in deterministic order', () => {
    const { io, stderr, stdout } = createCapturedIo();

    const exitCode = runKpaCheck(['--json', 'Page.kpa'], {
      createWorkspaceGraph() {
        return {
          collectDiagnosticsForPaths() {
            return [
              {
                diagnostics: [
                  {
                    code: 'beta-code',
                    data: {
                      symbol: 'beta',
                    },
                    message: 'beta',
                    range: {
                      endChar: 4,
                      line: 1,
                      startChar: 3,
                    },
                  },
                  {
                    code: 'alpha-code',
                    data: {
                      symbol: 'alpha',
                    },
                    message: 'alpha',
                    range: {
                      endChar: 1,
                      line: 1,
                      startChar: 0,
                    },
                  },
                ],
                filePath: '/workspace/project/Page.kpa',
              },
            ];
          },
          getKpaFilePaths() {
            return ['/workspace/project/Page.kpa'];
          },
        } satisfies KpaCheckWorkspaceGraph;
      },
      cwd: '/workspace/project',
      fileExists: () => true,
      io,
    });

    expect(exitCode).toBe(1);
    expect(stderr).toEqual([]);
    expect(JSON.parse(stdout[0] ?? '')).toEqual({
      cwd: '/workspace/project',
      diagnostics: [
        {
          character: 1,
          code: 'alpha-code',
          data: {
            symbol: 'alpha',
          },
          filePath: '/workspace/project/Page.kpa',
          line: 2,
          message: 'alpha',
          relativeFilePath: 'Page.kpa',
          severity: 'warning',
        },
        {
          character: 4,
          code: 'beta-code',
          data: {
            symbol: 'beta',
          },
          filePath: '/workspace/project/Page.kpa',
          line: 2,
          message: 'beta',
          relativeFilePath: 'Page.kpa',
          severity: 'warning',
        },
      ],
      exitCode: 1,
      kind: 'check',
      message: 'kpa-check: 2 Diagnostic(s) in 1 .kpa-Datei(en) gefunden.',
      missingTargets: [],
      requestedTargets: ['Page.kpa'],
      resolvedTargets: ['/workspace/project/Page.kpa'],
      status: 'diagnostics',
      summary: {
        checkedFileCount: 1,
        diagnosticCount: 2,
        targetCount: 1,
      },
    });
  });

  it('returns diagnostics from the real workspace graph with deterministic formatting', () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'kpa-check-'));
    const componentPath = path.join(tempDirectory, 'UserCard.kpa');
    const pagePath = path.join(tempDirectory, 'Page.kpa');

    fs.writeFileSync(
      componentPath,
      ['[template]', '  <div></div>', '[/template]', '', '[ts]', '  export const x = 1;', '[/ts]']
        .join('\n')
        .concat('\n'),
    );
    fs.writeFileSync(
      pagePath,
      [
        '[template]',
        '  <UserCard />',
        '  <div>{{missing}}</div>',
        '[/template]',
        '',
        '[ts]',
        "  import UserCard from './UserCard';",
        '[/ts]',
      ]
        .join('\n')
        .concat('\n'),
    );

    const { io, stderr, stdout } = createCapturedIo();
    const exitCode = runKpaCheck([tempDirectory], {
      cwd: tempDirectory,
      io,
    });

    expect(exitCode).toBe(1);
    expect(stdout).toEqual([
      'Page.kpa:3:10 warning Lokales Template-Symbol [missing] wurde nicht gefunden.',
    ]);
    expect(stderr).toEqual([
      'kpa-check: 1 Diagnostic(s) in 2 .kpa-Datei(en) gefunden.',
    ]);
  });
});
