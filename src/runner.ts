import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  KpaWorkspaceGraph,
  type KpaWorkspaceFileDiagnostics,
} from '@koppajs/koppajs-language-core';

export type KpaCheckExitCode = 0 | 1 | 2;
export type KpaCheckOutputFormat = 'text' | 'json';

export interface KpaCheckIo {
  log(message: string): void;
  error(message: string): void;
}

export interface ResolveCliTargetsOptions {
  cwd?: string;
  fileExists?: (targetPath: string) => boolean;
}

export interface KpaCheckWorkspaceGraph {
  getKpaFilePaths(additionalPaths?: readonly (string | undefined)[]): readonly string[];
  collectDiagnosticsForPaths(
    paths: readonly string[],
    additionalPaths?: readonly (string | undefined)[],
  ): readonly KpaWorkspaceFileDiagnostics[];
}

export interface RunKpaCheckOptions {
  cwd?: string;
  io?: KpaCheckIo;
  fileExists?: (targetPath: string) => boolean;
  createWorkspaceGraph?: (targets: readonly string[]) => KpaCheckWorkspaceGraph;
  outputFormat?: KpaCheckOutputFormat;
  packageName?: string;
  version?: string;
}

export interface KpaCheckDiagnostic {
  code?: number | string;
  data?: unknown;
  message: string;
  range: {
    line: number;
    startChar: number;
  };
}

interface KpaCheckPackageMetadata {
  name: string;
  version: string;
}

interface KpaCheckJsonDiagnostic {
  character: number;
  code?: number | string;
  data?: unknown;
  filePath: string;
  line: number;
  message: string;
  relativeFilePath: string;
  severity: 'warning';
}

interface KpaCheckJsonSummary {
  checkedFileCount: number;
  diagnosticCount: number;
  targetCount: number;
}

interface KpaCheckJsonCheckResult {
  cwd: string;
  diagnostics: readonly KpaCheckJsonDiagnostic[];
  errorKind?: 'conflicting-options' | 'invalid-option' | 'missing-targets';
  exitCode: KpaCheckExitCode;
  kind: 'check';
  message: string;
  missingTargets: readonly string[];
  requestedTargets: readonly string[];
  resolvedTargets: readonly string[];
  status: 'diagnostics' | 'error' | 'ok';
  summary: KpaCheckJsonSummary;
}

interface KpaCheckJsonHelpResult {
  description: string;
  kind: 'help';
  options: readonly {
    description: string;
    flag: '--help' | '--json' | '--version';
  }[];
  packageName: string;
  usage: string;
  version: string;
}

interface KpaCheckJsonVersionResult {
  kind: 'version';
  packageName: string;
  version: string;
}

type KpaCheckJsonResult =
  | KpaCheckJsonCheckResult
  | KpaCheckJsonHelpResult
  | KpaCheckJsonVersionResult;

type ParseCliInvocationResult =
  | {
      command: 'check';
      outputFormat: KpaCheckOutputFormat;
      status: 'ok';
      targets: readonly string[];
    }
  | {
      command: 'help' | 'version';
      outputFormat: KpaCheckOutputFormat;
      status: 'ok';
      targets: readonly string[];
    }
  | {
      errorKind: 'conflicting-options' | 'invalid-option';
      exitCode: 2;
      message: string;
      outputFormat: KpaCheckOutputFormat;
      requestedTargets: readonly string[];
      status: 'error';
    };

export type ResolveCliTargetsResult =
  | {
      status: 'ok';
      targets: readonly string[];
    }
  | {
      errorKind: 'missing-targets';
      exitCode: 2;
      message: string;
      missingTargets: readonly string[];
      status: 'error';
    };

const defaultIo: KpaCheckIo = {
  error(message) {
    console.error(message);
  },
  log(message) {
    console.log(message);
  },
};

const helpOptions = [
  {
    description: 'Show this help text and exit.',
    flag: '--help',
  },
  {
    description: 'Print the package version and exit.',
    flag: '--version',
  },
  {
    description: 'Emit machine-readable JSON output.',
    flag: '--json',
  },
] as const;

let cachedPackageMetadata: KpaCheckPackageMetadata | undefined;
const packageRootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function compareDiagnostics(left: KpaCheckDiagnostic, right: KpaCheckDiagnostic): number {
  if (left.range.line !== right.range.line) {
    return left.range.line - right.range.line;
  }

  if (left.range.startChar !== right.range.startChar) {
    return left.range.startChar - right.range.startChar;
  }

  return left.message.localeCompare(right.message);
}

function getPackageMetadata(): KpaCheckPackageMetadata {
  if (cachedPackageMetadata) {
    return cachedPackageMetadata;
  }

  const packageJsonPath = path.join(packageRootDirectory, 'package.json');
  const packageJson = JSON.parse(
    fs.readFileSync(packageJsonPath, 'utf8'),
  ) as KpaCheckPackageMetadata;

  cachedPackageMetadata = {
    name: packageJson.name,
    version: packageJson.version,
  };

  return cachedPackageMetadata;
}

function getEffectivePackageMetadata(options: RunKpaCheckOptions): KpaCheckPackageMetadata {
  if (options.packageName !== undefined && options.version !== undefined) {
    return {
      name: options.packageName,
      version: options.version,
    };
  }

  const packageMetadata = getPackageMetadata();

  return {
    name: options.packageName ?? packageMetadata.name,
    version: options.version ?? packageMetadata.version,
  };
}

function formatRelativePath(cwd: string, filePath: string): string {
  return path.relative(cwd, filePath) || path.basename(filePath);
}

function formatHelpText(packageName: string, version: string): string {
  return [
    `${packageName} ${version}`,
    '',
    'Usage:',
    '  kpa-check [options] [targets...]',
    '',
    'Run KoppaJS diagnostics for .kpa files.',
    '',
    'Options:',
    ...helpOptions.map((option) => `  ${option.flag.padEnd(10)}${option.description}`),
    '',
    'Notes:',
    '  Targets may be files or directories.',
    '  With no targets, kpa-check checks the current working directory.',
  ].join('\n');
}

function writeJson(io: KpaCheckIo, payload: KpaCheckJsonResult): void {
  io.log(JSON.stringify(payload, null, 2));
}

function determineOutputFormat(
  argv: readonly string[],
  defaultOutputFormat: KpaCheckOutputFormat,
): KpaCheckOutputFormat {
  let endOfOptions = false;

  for (const argument of argv) {
    if (endOfOptions) {
      continue;
    }

    if (argument === '--') {
      endOfOptions = true;
      continue;
    }

    if (argument === '--json') {
      return 'json';
    }
  }

  return defaultOutputFormat;
}

function parseCliInvocation(
  argv: readonly string[],
  defaultOutputFormat: KpaCheckOutputFormat,
): ParseCliInvocationResult {
  const outputFormat = determineOutputFormat(argv, defaultOutputFormat);
  const targets: string[] = [];
  let command: 'check' | 'help' | 'version' = 'check';
  let endOfOptions = false;

  for (const argument of argv) {
    if (endOfOptions) {
      targets.push(argument);
      continue;
    }

    if (argument === '--') {
      endOfOptions = true;
      continue;
    }

    if (argument === '--json') {
      continue;
    }

    if (argument === '--help' || argument === '--version') {
      const nextCommand = argument === '--help' ? 'help' : 'version';

      if (command !== 'check' && command !== nextCommand) {
        return {
          errorKind: 'conflicting-options',
          exitCode: 2,
          message:
            'kpa-check hat widerspruechliche Steueroptionen erhalten: --help, --version',
          outputFormat,
          requestedTargets: targets,
          status: 'error',
        };
      }

      command = nextCommand;
      continue;
    }

    if (argument.startsWith('-')) {
      return {
        errorKind: 'invalid-option',
        exitCode: 2,
        message: `kpa-check hat eine unbekannte Option erhalten: ${argument}`,
        outputFormat,
        requestedTargets: targets,
        status: 'error',
      };
    }

    targets.push(argument);
  }

  return {
    command,
    outputFormat,
    status: 'ok',
    targets,
  };
}

function toJsonDiagnostic(
  filePath: string,
  diagnostic: KpaCheckDiagnostic,
  cwd: string,
): KpaCheckJsonDiagnostic {
  return {
    character: diagnostic.range.startChar + 1,
    code: diagnostic.code,
    data: diagnostic.data,
    filePath,
    line: diagnostic.range.line + 1,
    message: diagnostic.message,
    relativeFilePath: formatRelativePath(cwd, filePath),
    severity: 'warning',
  };
}

export function resolveCliTargets(
  argv: readonly string[],
  options: ResolveCliTargetsOptions = {},
): ResolveCliTargetsResult {
  const cwd = options.cwd ?? process.cwd();
  const fileExists = options.fileExists ?? fs.existsSync;
  const cliTargets = argv.length > 0 ? argv : [cwd];
  const uniqueTargets = new Set<string>();
  const resolvedTargets = cliTargets
    .map((targetPath) => path.resolve(cwd, targetPath))
    .filter((targetPath) => {
      if (uniqueTargets.has(targetPath)) {
        return false;
      }

      uniqueTargets.add(targetPath);
      return true;
    });
  const missingTargets = resolvedTargets.filter((targetPath) => !fileExists(targetPath));

  if (missingTargets.length > 0) {
    const formattedTargets = missingTargets.map((targetPath) => formatRelativePath(cwd, targetPath));

    return {
      errorKind: 'missing-targets',
      exitCode: 2,
      message: [
        `kpa-check hat ${missingTargets.length} nicht existierende(s) Ziel(e) erhalten:`,
        ...formattedTargets.map((targetPath) => `- ${targetPath}`),
      ].join('\n'),
      missingTargets,
      status: 'error',
    };
  }

  return {
    status: 'ok',
    targets: resolvedTargets,
  };
}

export function formatDiagnostic(
  filePath: string,
  diagnostic: KpaCheckDiagnostic,
  cwd = process.cwd(),
): string {
  const relativeFilePath = formatRelativePath(cwd, filePath);
  const line = diagnostic.range.line + 1;
  const character = diagnostic.range.startChar + 1;

  return `${relativeFilePath}:${line}:${character} warning ${diagnostic.message}`;
}

export function runKpaCheck(
  argv: readonly string[],
  options: RunKpaCheckOptions = {},
): KpaCheckExitCode {
  const cwd = options.cwd ?? process.cwd();
  const io = options.io ?? defaultIo;
  const parsedInvocation = parseCliInvocation(argv, options.outputFormat ?? 'text');

  if (parsedInvocation.status === 'error') {
    if (parsedInvocation.outputFormat === 'json') {
      writeJson(io, {
        cwd,
        diagnostics: [],
        errorKind: parsedInvocation.errorKind,
        exitCode: parsedInvocation.exitCode,
        kind: 'check',
        message: parsedInvocation.message,
        missingTargets: [],
        requestedTargets: parsedInvocation.requestedTargets,
        resolvedTargets: [],
        status: 'error',
        summary: {
          checkedFileCount: 0,
          diagnosticCount: 0,
          targetCount: parsedInvocation.requestedTargets.length,
        },
      });
    } else {
      io.error(parsedInvocation.message);
    }

    return parsedInvocation.exitCode;
  }

  if (parsedInvocation.command === 'help') {
    const packageMetadata = getEffectivePackageMetadata(options);

    if (parsedInvocation.outputFormat === 'json') {
      writeJson(io, {
        description: 'Run KoppaJS diagnostics for .kpa files.',
        kind: 'help',
        options: helpOptions,
        packageName: packageMetadata.name,
        usage: 'kpa-check [options] [targets...]',
        version: packageMetadata.version,
      });
    } else {
      io.log(formatHelpText(packageMetadata.name, packageMetadata.version));
    }

    return 0;
  }

  if (parsedInvocation.command === 'version') {
    const packageMetadata = getEffectivePackageMetadata(options);

    if (parsedInvocation.outputFormat === 'json') {
      writeJson(io, {
        kind: 'version',
        packageName: packageMetadata.name,
        version: packageMetadata.version,
      });
    } else {
      io.log(packageMetadata.version);
    }

    return 0;
  }

  const resolvedTargets = resolveCliTargets(parsedInvocation.targets, {
    cwd,
    fileExists: options.fileExists,
  });

  if (resolvedTargets.status === 'error') {
    if (parsedInvocation.outputFormat === 'json') {
      writeJson(io, {
        cwd,
        diagnostics: [],
        errorKind: resolvedTargets.errorKind,
        exitCode: resolvedTargets.exitCode,
        kind: 'check',
        message: resolvedTargets.message,
        missingTargets: resolvedTargets.missingTargets,
        requestedTargets: parsedInvocation.targets,
        resolvedTargets: [],
        status: 'error',
        summary: {
          checkedFileCount: 0,
          diagnosticCount: 0,
          targetCount: parsedInvocation.targets.length,
        },
      });
    } else {
      io.error(resolvedTargets.message);
    }

    return resolvedTargets.exitCode;
  }

  const createWorkspaceGraph =
    options.createWorkspaceGraph ??
    ((targets: readonly string[]) => new KpaWorkspaceGraph({ rootPaths: targets }));
  const workspaceGraph = createWorkspaceGraph(resolvedTargets.targets);
  const filePaths = [...workspaceGraph.getKpaFilePaths(resolvedTargets.targets)].sort((left, right) =>
    left.localeCompare(right),
  );

  if (filePaths.length === 0) {
    const message = 'kpa-check hat keine .kpa-Dateien gefunden.';

    if (parsedInvocation.outputFormat === 'json') {
      writeJson(io, {
        cwd,
        diagnostics: [],
        exitCode: 0,
        kind: 'check',
        message,
        missingTargets: [],
        requestedTargets: parsedInvocation.targets,
        resolvedTargets: resolvedTargets.targets,
        status: 'ok',
        summary: {
          checkedFileCount: 0,
          diagnosticCount: 0,
          targetCount: resolvedTargets.targets.length,
        },
      });
    } else {
      io.log(message);
    }

    return 0;
  }

  const diagnosticsByFile = [...workspaceGraph.collectDiagnosticsForPaths(filePaths)].sort(
    (left, right) => left.filePath.localeCompare(right.filePath),
  );
  let diagnosticCount = 0;
  const jsonDiagnostics: KpaCheckJsonDiagnostic[] = [];

  for (const { diagnostics, filePath } of diagnosticsByFile) {
    const sortedDiagnostics = [...diagnostics].sort(compareDiagnostics);

    for (const diagnostic of sortedDiagnostics) {
      if (parsedInvocation.outputFormat === 'json') {
        jsonDiagnostics.push(toJsonDiagnostic(filePath, diagnostic, cwd));
      } else {
        io.log(formatDiagnostic(filePath, diagnostic, cwd));
      }

      diagnosticCount++;
    }
  }

  if (diagnosticCount === 0) {
    const message = `kpa-check: ${diagnosticsByFile.length} .kpa-Datei(en) geprueft, keine Diagnostics gefunden.`;

    if (parsedInvocation.outputFormat === 'json') {
      writeJson(io, {
        cwd,
        diagnostics: [],
        exitCode: 0,
        kind: 'check',
        message,
        missingTargets: [],
        requestedTargets: parsedInvocation.targets,
        resolvedTargets: resolvedTargets.targets,
        status: 'ok',
        summary: {
          checkedFileCount: diagnosticsByFile.length,
          diagnosticCount,
          targetCount: resolvedTargets.targets.length,
        },
      });
    } else {
      io.log(message);
    }

    return 0;
  }

  const message = `kpa-check: ${diagnosticCount} Diagnostic(s) in ${diagnosticsByFile.length} .kpa-Datei(en) gefunden.`;

  if (parsedInvocation.outputFormat === 'json') {
    writeJson(io, {
      cwd,
      diagnostics: jsonDiagnostics,
      exitCode: 1,
      kind: 'check',
      message,
      missingTargets: [],
      requestedTargets: parsedInvocation.targets,
      resolvedTargets: resolvedTargets.targets,
      status: 'diagnostics',
      summary: {
        checkedFileCount: diagnosticsByFile.length,
        diagnosticCount,
        targetCount: resolvedTargets.targets.length,
      },
    });
  } else {
    io.error(message);
  }

  return 1;
}
