// Feature: office-lunch-turborepo, Property 1: No cross-boundary relative imports

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Validates: Requirements 13.2, 13.3
 *
 * Property 1: No cross-boundary relative imports
 * For any TypeScript file in the turborepo/ workspace, the file SHALL NOT
 * contain a relative import path that traverses outside its own package boundary.
 */

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../../..');
const TURBOREPO_ROOT = path.join(WORKSPACE_ROOT, 'turborepo');

// Package roots — each TypeScript file must not import outside its own package root
const PACKAGE_ROOTS = [
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

function collectTsFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      results.push(...collectTsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractRelativeImports(content: string): string[] {
  const importRegex = /(?:import|export)\s+(?:[^'"]*\s+from\s+)?['"](\.[^'"]+)['"]/g;
  const matches: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = importRegex.exec(content)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}

function getPackageRoot(filePath: string): string | null {
  for (const pkgRoot of PACKAGE_ROOTS) {
    if (filePath.startsWith(pkgRoot + path.sep) || filePath === pkgRoot) {
      return pkgRoot;
    }
  }
  return null;
}

function crossesBoundary(importingFile: string, importSpecifier: string, packageRoot: string): boolean {
  const importingDir = path.dirname(importingFile);
  const resolved = path.resolve(importingDir, importSpecifier);
  const normalised = path.normalize(resolved);
  const normalisedRoot = path.normalize(packageRoot);
  return !normalised.startsWith(normalisedRoot + path.sep) && normalised !== normalisedRoot;
}

describe('Property 1: No cross-boundary relative imports across all workspace files', () => {
  it('no .ts file in turborepo/ contains a relative import that escapes its package boundary', () => {
    const allFiles: string[] = [];
    for (const pkgRoot of PACKAGE_ROOTS) {
      allFiles.push(...collectTsFiles(pkgRoot));
    }

    expect(allFiles.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(fc.constantFrom(...allFiles), (filePath: string) => {
        const packageRoot = getPackageRoot(filePath);
        if (!packageRoot) return true; // file not in a known package, skip

        const content = fs.readFileSync(filePath, 'utf-8');
        const relativeImports = extractRelativeImports(content);

        for (const importSpecifier of relativeImports) {
          if (crossesBoundary(filePath, importSpecifier, packageRoot)) {
            const relFile = path.relative(TURBOREPO_ROOT, filePath);
            throw new Error(
              `Cross-boundary import in "${relFile}": "${importSpecifier}" escapes package boundary`
            );
          }
        }

        return true;
      }),
      { numRuns: allFiles.length }
    );
  });
});
