import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

describe('lint toolchain with the patched minimatch', () => {
  it('selects TypeScript and script files, applies rules, and ignores build output', async () => {
    const eslint = new ESLint();
    const typescriptResults = await eslint.lintText('const unusedValue: number = 1;\n', {
      filePath: 'src/security-regression.ts',
    });
    const scriptResults = await eslint.lintText('var value = 1;\n', {
      filePath: 'scripts/security-regression.mjs',
    });

    expect(typescriptResults[0]?.messages.map((message) => message.ruleId))
      .toContain('@typescript-eslint/no-unused-vars');
    expect(scriptResults[0]?.messages.map((message) => message.ruleId))
      .toContain('no-var');
    expect(await eslint.isPathIgnored('dist/security-regression.js')).toBe(true);
    expect(await eslint.isPathIgnored('node_modules/security-regression/index.js')).toBe(true);
  });
});
