import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

interface PackageManifest {
  bin: Record<string, string>;
  dependencies: Record<string, string>;
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

    expect(packageManifest.name).toBe('@koppajs/koppajs-kpa-check');
    expect(Object.keys(packageManifest.exports).sort()).toEqual(['.']);
    expect(packageManifest.main).toBe('./dist/index.js');
    expect(packageManifest.types).toBe('./dist/index.d.ts');
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
    expect(packageManifest.dependencies['@koppajs/koppajs-language-core']).toBe('^0.1.2');
    expect(packageManifest.dependencies['@koppajs/language-core']).toBeUndefined();
    expect(packageManifest.scripts.prepack).toBe('npm run validate');
  });
});
