// Feature: office-lunch-turborepo, Property 1: No cross-boundary relative imports

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Validates: Requirements 13.2, 13.3
 *
 * Property 1: No cross-boundary relative imports
 * For any TypeScript file in turborepo/packages/shared-ui/src/, the file SHALL NOT
 * contain a relative import path that traverses outside the package boundary
 * (turborepo/packages/shared-ui/).
 */

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../..');
const PACKAGE_ROOT = path.resolve(WORKSPACE_ROOT, 'turborepo/packages/shared-ui');
const SRC_ROOT = path.resolve(PACKAGE_ROOT, 'src');

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

/** Extract all relative import specifiers from a TypeScript file's content */
function extractRelativeImports(content: string): string[] {
  const importRegex = /(?:import|export)\s+(?:[^'"]*\s+from\s+)?['"](\.[^'"]+)['"]/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

/** Returns true if the resolved import path escapes the package root */
function crossesBoundary(importingFile: string, importSpecifier: string): boolean {
  const importingDir = path.dirname(importingFile);
  const resolved = path.resolve(importingDir, importSpecifier);
  // Normalise both paths to ensure consistent comparison
  const normalisedResolved = path.normalize(resolved);
  const normalisedPackageRoot = path.normalize(PACKAGE_ROOT);
  return !normalisedResolved.startsWith(normalisedPackageRoot + path.sep) &&
         normalisedResolved !== normalisedPackageRoot;
}

describe('Property 1: No cross-boundary relative imports in shared-ui', () => {
  it('no .ts file in src/ contains a relative import that escapes the package boundary', () => {
    const tsFiles = collectTsFiles(SRC_ROOT);

    // Use fast-check to enumerate the collected files as the arbitrary
    fc.assert(
      fc.property(
        fc.constantFrom(...tsFiles),
        (filePath: string) => {
          const content = fs.readFileSync(filePath, 'utf-8');
          const relativeImports = extractRelativeImports(content);

          for (const importSpecifier of relativeImports) {
            if (crossesBoundary(filePath, importSpecifier)) {
              const relFile = path.relative(PACKAGE_ROOT, filePath);
              throw new Error(
                `Cross-boundary import detected in "${relFile}": "${importSpecifier}" resolves outside turborepo/packages/shared-ui/`
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
