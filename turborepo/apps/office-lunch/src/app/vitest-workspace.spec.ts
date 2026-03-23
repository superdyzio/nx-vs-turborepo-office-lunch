// Feature: office-lunch-turborepo, Property 6: vitest.workspace.ts references all package vitest configs

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Validates: Requirements 15.1
 *
 * Property 6: vitest.workspace.ts references all package vitest configs
 * For any package directory under turborepo/packages/ and for the shell app,
 * the root vitest.workspace.ts SHALL contain a reference to that package's
 * vitest.config.ts.
 */

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../../..');
const TURBOREPO_ROOT = path.join(WORKSPACE_ROOT, 'turborepo');

const EXPECTED_VITEST_CONFIG_REFS = [
  'apps/office-lunch/vitest.config.ts',
  'packages/shared-models/vitest.config.ts',
  'packages/shared-ui/vitest.config.ts',
  'packages/data-access/vitest.config.ts',
  'packages/auth/vitest.config.ts',
  'packages/util/vitest.config.ts',
  'packages/feature-login/vitest.config.ts',
  'packages/feature-departure/vitest.config.ts',
  'packages/feature-voting/vitest.config.ts',
  'packages/feature-ordering/vitest.config.ts',
  'packages/feature-admin/vitest.config.ts',
];

describe('Property 6: vitest.workspace.ts references all package vitest configs', () => {
  let workspaceContent: string;

  beforeAll(() => {
    const workspacePath = path.join(TURBOREPO_ROOT, 'vitest.workspace.ts');
    expect(fs.existsSync(workspacePath)).toBe(true);
    workspaceContent = fs.readFileSync(workspacePath, 'utf-8');
  });

  it('vitest.workspace.ts contains a reference to every package vitest.config.ts', () => {
    fc.assert(
      fc.property(fc.constantFrom(...EXPECTED_VITEST_CONFIG_REFS), (configRef: string) => {
        if (!workspaceContent.includes(configRef)) {
          throw new Error(
            `turborepo/vitest.workspace.ts does not reference "${configRef}"`
          );
        }
        return true;
      }),
      { numRuns: EXPECTED_VITEST_CONFIG_REFS.length }
    );
  });
});
