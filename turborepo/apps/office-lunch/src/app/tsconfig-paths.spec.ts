// Feature: office-lunch-turborepo, Property 5: Every package has a path alias in root tsconfig.json

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Validates: Requirements 1.3
 *
 * Property 5: Every package has a path alias in root tsconfig.json
 * For any package directory under turborepo/packages/, there SHALL exist a
 * corresponding entry in the root tsconfig.json paths object mapping
 * @office-lunch/<package-name> to that package's index.ts.
 */

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../../..');
const TURBOREPO_ROOT = path.join(WORKSPACE_ROOT, 'turborepo');

const EXPECTED_ALIASES: { alias: string; indexPath: string }[] = [
  { alias: '@office-lunch/shared-models', indexPath: 'packages/shared-models/index.ts' },
  { alias: '@office-lunch/shared-ui', indexPath: 'packages/shared-ui/index.ts' },
  { alias: '@office-lunch/data-access', indexPath: 'packages/data-access/index.ts' },
  { alias: '@office-lunch/auth', indexPath: 'packages/auth/index.ts' },
  { alias: '@office-lunch/util', indexPath: 'packages/util/index.ts' },
  { alias: '@office-lunch/feature-login', indexPath: 'packages/feature-login/index.ts' },
  { alias: '@office-lunch/feature-departure', indexPath: 'packages/feature-departure/index.ts' },
  { alias: '@office-lunch/feature-voting', indexPath: 'packages/feature-voting/index.ts' },
  { alias: '@office-lunch/feature-ordering', indexPath: 'packages/feature-ordering/index.ts' },
  { alias: '@office-lunch/feature-admin', indexPath: 'packages/feature-admin/index.ts' },
];

describe('Property 5: Every package has a path alias in root tsconfig.json', () => {
  let tsconfigPaths: Record<string, string[]>;

  beforeAll(() => {
    const tsconfigPath = path.join(TURBOREPO_ROOT, 'tsconfig.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);
    const content = fs.readFileSync(tsconfigPath, 'utf-8');
    const tsconfig = JSON.parse(content);
    tsconfigPaths = tsconfig?.compilerOptions?.paths ?? {};
  });

  it('root tsconfig.json has a paths entry for every package', () => {
    fc.assert(
      fc.property(fc.constantFrom(...EXPECTED_ALIASES), ({ alias, indexPath }) => {
        if (!(alias in tsconfigPaths)) {
          throw new Error(`Missing path alias "${alias}" in turborepo/tsconfig.json`);
        }

        const mappedPaths: string[] = tsconfigPaths[alias];
        const hasCorrectPath = mappedPaths.some((p) => p === indexPath);

        if (!hasCorrectPath) {
          throw new Error(
            `Path alias "${alias}" in turborepo/tsconfig.json does not map to "${indexPath}". Found: ${JSON.stringify(mappedPaths)}`
          );
        }

        return true;
      }),
      { numRuns: EXPECTED_ALIASES.length }
    );
  });
});
