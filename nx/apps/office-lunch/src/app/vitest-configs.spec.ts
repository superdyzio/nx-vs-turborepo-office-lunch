// Feature: office-lunch-nx, Property 4: Every library has a vitest config with jsdom environment

import * as fc from 'fast-check';
import { readFileSync, existsSync } from 'fs';
import * as path from 'path';

// **Validates: Requirements 15.2**

const NX_ROOT = path.resolve(__dirname, '../../../..');
const NX_DIR = NX_ROOT;

// All library directories and the shell app that must have a vitest.config.ts
const PROJECTS = [
  'libs/shared/models',
  'libs/shared/ui',
  'libs/data-access',
  'libs/auth',
  'libs/util',
  'libs/feature-login',
  'libs/feature-departure',
  'libs/feature-voting',
  'libs/feature-ordering',
  'libs/feature-admin',
  'apps/office-lunch',
];

describe('Property 4: Every library has a vitest.config.ts with jsdom environment', () => {
  it('every project directory has a vitest.config.ts that specifies jsdom environment', () => {
    fc.assert(
      fc.property(fc.constantFrom(...PROJECTS), (projectDir) => {
        const configPath = path.join(NX_DIR, projectDir, 'vitest.config.ts');
        if (!existsSync(configPath)) return false;
        const content = readFileSync(configPath, 'utf-8');
        return content.includes("'jsdom'") || content.includes('"jsdom"');
      }),
    );
  });
});
