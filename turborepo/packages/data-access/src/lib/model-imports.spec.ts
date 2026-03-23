// Feature: office-lunch-turborepo, Property 3: Data-access package imports models only from the shared-models alias

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Validates: Requirements 5.3
 *
 * Property 3: Data-access package imports models only from the shared-models alias
 * For any TypeScript file in turborepo/packages/data-access/src/, every import of a
 * model type SHALL use the `@office-lunch/shared-models` path alias, not a relative
 * path pointing to a model file.
 *
 * A "model import" is any import where the specifier:
 * - Contains `.model` in the path
 * - OR resolves to a file in a `models/` directory
 */

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../..');
const SRC_ROOT = path.resolve(WORKSPACE_ROOT, 'turborepo/packages/data-access/src');

/** Recursively collect all .ts files under a directory */
function collectTsFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Extract all import specifiers (both relative and non-relative) from a TypeScript file */
function extractImportSpecifiers(content: string): string[] {
  const importRegex = /(?:import|export)\s+(?:[^'"]*\s+from\s+)?['"]([^'"]+)['"]/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

/**
 * Returns true if the import specifier is a relative path that points to a model file.
 * A model import is identified by:
 * - The specifier containing `.model` in the path
 * - OR the specifier containing a `models/` directory segment
 */
function isRelativeModelImport(specifier: string): boolean {
  if (!specifier.startsWith('.')) {
    // Non-relative imports (e.g. `@office-lunch/shared-models`) are allowed
    return false;
  }
  const normalised = specifier.replace(/\\/g, '/');
  return normalised.includes('.model') || /(?:^|\/)models\//.test(normalised);
}

describe('Property 3: Data-access package imports models only from the shared-models alias', () => {
  it('no .ts file in src/ uses a relative import to reference a model file', () => {
    const tsFiles = collectTsFiles(SRC_ROOT);

    fc.assert(
      fc.property(
        fc.constantFrom(...tsFiles),
        (filePath: string) => {
          const content = fs.readFileSync(filePath, 'utf-8');
          const specifiers = extractImportSpecifiers(content);

          for (const specifier of specifiers) {
            if (isRelativeModelImport(specifier)) {
              const relFile = path.relative(SRC_ROOT, filePath);
              throw new Error(
                `Relative model import detected in "${relFile}": "${specifier}" — use @office-lunch/shared-models instead`
              );
            }
          }

          return true;
        }
      ),
      { numRuns: tsFiles.length }
    );
  });
});
