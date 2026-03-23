// Feature: office-lunch-nx, Property 1: No cross-boundary relative imports

import * as fc from 'fast-check';
import { readFileSync, readdirSync, statSync } from 'fs';
import * as path from 'path';

// **Validates: Requirements 13.2, 13.3**

function collectTsFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...collectTsFiles(full));
    } else if (entry.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results;
}

const NX_ROOT = path.resolve(__dirname, '../../../..');
const NX_DIR = NX_ROOT;

// Collect all .ts files from libs/ and apps/ (excluding node_modules)
function collectWorkspaceTsFiles(): string[] {
  const files: string[] = [];
  for (const dir of ['libs', 'apps']) {
    const fullDir = path.join(NX_DIR, dir);
    files.push(...collectTsFiles(fullDir));
  }
  return files.filter((f) => !f.includes('node_modules'));
}

const tsFiles = collectWorkspaceTsFiles().filter(
  (f) => !path.basename(f).includes('vitest.config') && !path.basename(f).includes('test-setup'),
);

// Given a file path, determine which library root it belongs to
function getLibRoot(filePath: string): string | null {
  const rel = path.relative(NX_DIR, filePath);
  const parts = rel.split(path.sep);
  // apps/office-lunch/... → NX_DIR/apps/office-lunch
  // libs/shared/models/... → NX_DIR/libs/shared/models
  // libs/feature-login/... → NX_DIR/libs/feature-login
  if (parts[0] === 'apps' && parts.length >= 2) {
    return path.join(NX_DIR, parts[0], parts[1]);
  }
  if (parts[0] === 'libs' && parts.length >= 2) {
    // Handle nested libs like shared/models, shared/ui
    if (parts[1] === 'shared' && parts.length >= 3) {
      return path.join(NX_DIR, parts[0], parts[1], parts[2]);
    }
    return path.join(NX_DIR, parts[0], parts[1]);
  }
  return null;
}

describe('Property 1: No cross-boundary relative imports across all workspace files', () => {
  it('no TypeScript file contains a relative import that escapes its library boundary', () => {
    fc.assert(
      fc.property(fc.constantFrom(...tsFiles), (filePath) => {
        const libRoot = getLibRoot(filePath);
        if (!libRoot) return true;
        const content = readFileSync(filePath, 'utf-8');
        const importLines = content.match(/from\s+['"][^'"]+['"]/g) ?? [];
        return importLines.every((line) => {
          const match = line.match(/from\s+['"]([^'"]+)['"]/);
          if (!match) return true;
          const importPath = match[1];
          if (!importPath.startsWith('.')) return true;
          const resolved = path.resolve(path.dirname(filePath), importPath);
          return resolved.startsWith(libRoot);
        });
      }),
    );
  });
});
