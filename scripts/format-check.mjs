import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ignoredDirectories = new Set(['.git', 'dist', 'node_modules']);
const textExtensions = new Set(['.json', '.md', '.mjs', '.ts', '.txt', '.yml', '.yaml']);
const textFileNames = new Set(['.gitignore']);
const formattingIssues = [];

walk(rootDirectory);

if (formattingIssues.length > 0) {
  console.error('Formatierungsprobleme gefunden:');

  for (const issue of formattingIssues) {
    console.error(`- ${issue}`);
  }

  process.exitCode = 1;
} else {
  console.log('Formatpruefung erfolgreich.');
}

function walk(directoryPath) {
  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (ignoredDirectories.has(entry.name)) {
        continue;
      }

      walk(path.join(directoryPath, entry.name));
      continue;
    }

    const absolutePath = path.join(directoryPath, entry.name);
    const relativePath = path.relative(rootDirectory, absolutePath);

    if (!isTextFile(entry.name)) {
      continue;
    }

    const text = fs.readFileSync(absolutePath, 'utf8');

    if (text.includes('\r')) {
      formattingIssues.push(`${relativePath}: Windows-Zeilenenden sind nicht erlaubt.`);
    }

    if (/[ \t]+$/m.test(text)) {
      formattingIssues.push(`${relativePath}: Zeilen mit nachgestellten Leerzeichen gefunden.`);
    }

    if (text.length > 0 && !text.endsWith('\n')) {
      formattingIssues.push(`${relativePath}: Abschliessender Zeilenumbruch fehlt.`);
    }
  }
}

function isTextFile(fileName) {
  if (textFileNames.has(fileName)) {
    return true;
  }

  return textExtensions.has(path.extname(fileName));
}
