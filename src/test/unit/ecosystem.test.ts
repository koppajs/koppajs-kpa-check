import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import koppajs from '@koppajs/koppajs-vite-plugin';
import { build } from 'vite';
import { describe, expect, it } from 'vitest';
import { runKpaCheck } from '../../runner.js';

describe('published KoppaJS ecosystem', () => {
  it('checks and bundles the same application with Core, Router, and the Vite plugin', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kpa-check-ecosystem-'));
    const src = path.join(root, 'src');
    const page = path.join(src, 'home-page.kpa');
    const stdout: string[] = [];
    const stderr: string[] = [];
    const io = {
      log(message: string) { stdout.push(message); },
      error(message: string) { stderr.push(message); },
    };
    const source = [
      '[template]',
      '  <div>{{count}}</div>',
      '[/template]',
      '[ts]',
      '  return { state: { count: 1 } };',
      '[/ts]',
      '',
    ].join('\n');

    try {
      fs.mkdirSync(src);
      fs.symlinkSync(path.join(process.cwd(), 'node_modules'), path.join(root, 'node_modules'), 'junction');
      fs.writeFileSync(path.join(root, 'tsconfig.json'), '{}\n');
      fs.writeFileSync(page, source);
      fs.writeFileSync(path.join(root, 'index.html'), '<div id="app"></div><script type="module" src="/src/main.ts"></script>\n');
      fs.writeFileSync(path.join(src, 'main.ts'), [
        "import { Core } from '@koppajs/koppajs-core';",
        "import { KoppajsRouter } from '@koppajs/koppajs-router';",
        "import homePage from './home-page.kpa';",
        "Core.take(homePage, 'home-page');",
        'Core();',
        'const router = new KoppajsRouter({',
        '  outlet: document.getElementById("app")!,',
        '  routes: [{ path: "/", name: "home", title: "Home", description: "Home page", componentTag: "home-page" }],',
        '});',
        'router.init();',
        '',
      ].join('\n'));

      const exitCode = runKpaCheck(['--json', src], { cwd: root, io });
      expect(exitCode, stdout.join('\n')).toBe(0);
      expect(stderr).toEqual([]);
      expect(stdout).toHaveLength(1);
      expect(JSON.parse(stdout[0] ?? '')).toMatchObject({
        diagnostics: [],
        summary: { checkedFileCount: 1 },
      });

      const result = await build({
        root,
        configFile: false,
        logLevel: 'silent',
        plugins: [koppajs()],
        build: { write: false, minify: false },
      });
      const outputs = Array.isArray(result) ? result : [result];
      const code = outputs.flatMap((output) => 'output' in output ? output.output : [])
        .filter((output) => output.type === 'chunk')
        .map((output) => output.code).join('\n');
      expect(code).toContain('home-page');
      expect(code).toContain('Home page');
      expect(code).not.toContain('from "@koppajs/');

      stdout.length = 0;
      fs.writeFileSync(page, source.replace('{{count}}', '{{missing}}'));
      expect(runKpaCheck(['--json', src], { cwd: root, io })).toBe(1);
      expect(stderr).toEqual([]);
      expect(JSON.parse(stdout[0] ?? '')).toMatchObject({
        diagnostics: [{ relativeFilePath: path.join('src', 'home-page.kpa'), line: 2, character: 10 }],
        summary: { checkedFileCount: 1, diagnosticCount: 1 },
      });
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
