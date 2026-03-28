import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

interface PackageManifest {
  bin: Record<string, string>;
  dependencies: Record<string, string>;
  engines?: {
    node?: string;
    npm?: string;
  };
  exports: Record<string, unknown>;
  files: readonly string[];
  main: string;
  name: string;
  publishConfig?: {
    access?: string;
  };
  scripts: Record<string, string>;
  types: string;
}

function readPackageManifest(): PackageManifest {
  return JSON.parse(
    readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'),
  ) as PackageManifest;
}

describe('package manifest', () => {
  it('publishes the scoped root package with the locked package surface', () => {
    const packageManifest = readPackageManifest();
    const nvmrc = readFileSync(path.join(process.cwd(), '.nvmrc'), 'utf8').trim();
    const npmrc = readFileSync(path.join(process.cwd(), '.npmrc'), 'utf8').trim();

    expect(packageManifest.name).toBe('@koppajs/koppajs-kpa-check');
    expect(Object.keys(packageManifest.exports).sort()).toEqual(['.']);
    expect(packageManifest.main).toBe('./dist/index.js');
    expect(packageManifest.types).toBe('./dist/index.d.ts');
    expect(packageManifest.engines?.node).toBe('>=22');
    expect(packageManifest.engines?.npm).toBe('>=10');
    expect(packageManifest.publishConfig?.access).toBe('public');
    expect(packageManifest.bin).toEqual({
      'kpa-check': './dist/cli.js',
    });
    expect(packageManifest.files).toEqual([
      'dist',
      'README.md',
      'CHANGELOG.md',
      'LICENSE',
    ]);
    expect(packageManifest.dependencies['@koppajs/koppajs-language-core']).toBe('^0.1.4');
    expect(packageManifest.dependencies['@koppajs/language-core']).toBeUndefined();
    expect(nvmrc).toBe('22');
    expect(npmrc).toContain('engine-strict=true');
    expect(packageManifest.scripts['check:docs:contract']).toBe(
      'node scripts/check-doc-contract.mjs',
    );
    expect(packageManifest.scripts['check:docs:semantics']).toBe(
      'node scripts/check-doc-semantics.mjs',
    );
    expect(packageManifest.scripts['check:docs']).toBe(
      'npm run check:docs:contract && npm run check:docs:semantics',
    );
    expect(packageManifest.scripts.prepack).toBe('npm run validate');
    expect(packageManifest.scripts['release:check']).toBe('npm pack --dry-run');
    expect(packageManifest.scripts['test:dist']).toBe('node scripts/check-dist-runtime.mjs');
    expect(packageManifest.scripts.validate).toBe(
      'npm run check:docs && npm run check:meta && npm run format:check && npm run lint && npm run typecheck && npm run test && npm run build && npm run test:dist',
    );
  });
});
