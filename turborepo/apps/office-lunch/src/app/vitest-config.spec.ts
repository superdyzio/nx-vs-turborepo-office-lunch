// Feature: office-lunch-turborepo, Property 4: Every package has a vitest config with jsdom environment

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Validates: Requirements 15.2
 *
 * Property 4: Every package has a vitest config with jsdom environment
 * For any package directory under turborepo/packages/ and for the shell app
 * at turborepo/apps/office-lunch/, there SHALL exist a vitest.config.ts file
 * whose test.environment is set to 'jsdom'.
 */

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../../..');
const TURBOREPO_ROOT = path.join(WORKSPACE_ROOT, 'turborepo');

const PACKAGE_DIRS = [
  path.join(TURBOREPO_ROOT, 'packages/shared-models'),
  path.join(TURBOREPO_ROOT, 'packages/shared-ui'),
  path.join(TURBOREPO_ROOT, 'packages/data-access'),
  path.join(TURBOREPO_ROOT, 'packages/auth'),
  path.join(TURBOREPO_ROOT, 'packages/util'),
  path.join(TURBOREPO_ROOT, 'packages/feature-login'),
  path.join(TURBOREPO_ROOT, 'packages/feature-departure'),
  path.join(TURBOREPO_ROOT, 'packages/feature-voting'),
  path.join(TURBOREPO_ROOT, 'packages/feature-ordering'),
  path.join(TURBOREPO_ROOT, 'packages/feature-admin'),
  path.join(TURBOREPO_ROOT, 'apps/office-lunch'),
];

describe('Property 4: Every package has a vitest.config.ts with jsdom environment', () => {
  it('every package directory has a vitest.config.ts', () => {
    fc.assert(
      fc.property(fc.constantFrom(...PACKAGE_DIRS), (pkgDir: string) => {
        const configPath = path.join(pkgDir, 'vitest.config.ts');
        const relDir = path.relative(TURBOREPO_ROOT, pkgDir);

        if (!fs.existsSync(configPath)) {
          throw new Error(`Missing vitest.config.ts in "${relDir}"`);
        }

        return true;
      }),
      { numRuns: PACKAGE_DIRS.length }
    );
  });

  it('every vitest.config.ts specifies jsdom as the test environment', () => {
    fc.assert(
      fc.property(fc.constantFrom(...PACKAGE_DIRS), (pkgDir: string) => {
        const configPath = path.join(pkgDir, 'vitest.config.ts');
        const relDir = path.relative(TURBOREPO_ROOT, pkgDir);

        if (!fs.existsSync(configPath)) {
          throw new Error(`Missing vitest.config.ts in "${relDir}"`);
        }

        const content = fs.readFileSync(configPath, 'utf-8');

        // Check for environment: 'jsdom' or environment: "jsdom"
        if (!content.includes("environment: 'jsdom'") && !content.includes('environment: "jsdom"')) {
          throw new Error(
            `vitest.config.ts in "${relDir}" does not set environment to 'jsdom'`
          );
        }

        return true;
      }),
      { numRuns: PACKAGE_DIRS.length }
    );
  });
});
