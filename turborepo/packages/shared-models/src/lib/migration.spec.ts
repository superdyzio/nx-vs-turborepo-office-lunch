// Feature: office-lunch-turborepo, Property 2: All base source files have a migrated equivalent

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Validates: Requirements 13.1
 *
 * Property 2 (scoped to models): For every .ts file in base/src/app/models/,
 * there SHALL exist a corresponding migrated file in
 * turborepo/packages/shared-models/src/lib/.
 */

const workspaceRoot = path.resolve(__dirname, '../../../../../..');
const baseModelsDir = path.join(workspaceRoot, 'base/src/app/models');
const migratedModelsDir = path.join(workspaceRoot, 'turborepo/packages/shared-models/src/lib');

function getTsFilesInDir(dir: string): string[] {
  return fs.readdirSync(dir).filter((f) => f.endsWith('.ts'));
}

describe('Property 2: All base model files have a migrated equivalent', () => {
  it('every .ts file in base/src/app/models/ has a corresponding file in shared-models/src/lib/', () => {
    const baseFiles = getTsFilesInDir(baseModelsDir);

    expect(baseFiles.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...baseFiles), (fileName) => {
        const migratedPath = path.join(migratedModelsDir, fileName);
        return fs.existsSync(migratedPath);
      }),
      { numRuns: baseFiles.length },
    );
  });
});
