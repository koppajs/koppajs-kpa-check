#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { KpaWorkspaceGraph } from '@koppajs/language-core';

function parseCliTargets(argv: readonly string[]): readonly string[] {
  const cliTargets = argv.length > 0 ? argv : [process.cwd()];
  const resolvedTargets = cliTargets.map((targetPath) => path.resolve(process.cwd(), targetPath));
  const existingTargets = resolvedTargets.filter((targetPath) => fs.existsSync(targetPath));

  if (existingTargets.length === 0) {
    console.error(
      'kpa-check hat keine existierenden Dateien oder Verzeichnisse zum Pruefen gefunden.',
    );
    process.exit(2);
  }

  return existingTargets;
}

function formatDiagnostic(
  filePath: string,
  diagnostic: {
    message: string;
    range: {
      line: number;
      startChar: number;
    };
  },
): string {
  const relativeFilePath = path.relative(process.cwd(), filePath) || path.basename(filePath);
  const line = diagnostic.range.line + 1;
  const character = diagnostic.range.startChar + 1;

  return `${relativeFilePath}:${line}:${character} warning ${diagnostic.message}`;
}

function main(): void {
  const targets = parseCliTargets(process.argv.slice(2));
  const workspaceGraph = new KpaWorkspaceGraph({ rootPaths: targets });
  const diagnosticsByFile = workspaceGraph.collectDiagnosticsForPaths(targets);

  if (diagnosticsByFile.length === 0) {
    console.log('kpa-check hat keine .kpa-Dateien gefunden.');
    return;
  }

  let diagnosticCount = 0;

  for (const { diagnostics, filePath } of diagnosticsByFile) {
    for (const diagnostic of diagnostics) {
      console.log(formatDiagnostic(filePath, diagnostic));
      diagnosticCount++;
    }
  }

  if (diagnosticCount === 0) {
    console.log(
      `kpa-check: ${diagnosticsByFile.length} .kpa-Datei(en) geprueft, keine Diagnostics gefunden.`,
    );
    return;
  }

  console.error(
    `kpa-check: ${diagnosticCount} Diagnostic(s) in ${diagnosticsByFile.length} .kpa-Datei(en) gefunden.`,
  );
  process.exit(1);
}

main();
