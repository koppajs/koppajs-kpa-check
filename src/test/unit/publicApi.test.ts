import { describe, expect, it } from 'vitest';
import * as publicApi from '../../index';

describe('public root module', () => {
  it('exports only the documented runtime contract and does not execute the CLI on import', () => {
    const runtimeKeys = Object.keys(publicApi)
      .filter((key) => key !== '__esModule' && key !== 'default' && key !== 'module.exports')
      .sort();

    expect(runtimeKeys).toEqual(['runKpaCheck']);
    expect(runtimeKeys).not.toContain('formatDiagnostic');
    expect(runtimeKeys).not.toContain('resolveCliTargets');
  });
});
