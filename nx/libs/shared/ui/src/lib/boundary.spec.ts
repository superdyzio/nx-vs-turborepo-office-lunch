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

const LIB_ROOT = path.resolve(__dirname, '../..');
const tsFiles = collectTsFiles(path.join(LIB_ROOT, 'src'));

describe('Property 1: No cross-boundary relative imports in shared/ui', () => {
  it('no TypeScript file contains a relative import that escapes the library boundary', () => {
    fc.assert(
      fc.property(fc.constantFrom(...tsFiles), (filePath) => {
        const content = readFileSync(filePath, 'utf-8');
        const importLines = content.match(/from\s+['"][^'"]+['"]/g) ?? [];
        return importLines.every((line) => {
          const match = line.match(/from\s+['"]([^'"]+)['"]/);
          if (!match) return true;
          const importPath = match[1];
          if (!importPath.startsWith('.')) return true;
          // Resolve the import relative to the file and check it stays within LIB_ROOT
          const resolved = path.resolve(path.dirname(filePath), importPath);
          return resolved.startsWith(LIB_ROOT);
        });
      }),
    );
  });
});
