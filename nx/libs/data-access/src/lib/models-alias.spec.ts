// Feature: office-lunch-nx, Property 3: Data-access library imports models only from the shared/models alias

import * as fc from 'fast-check';
import { readFileSync, readdirSync, statSync } from 'fs';
import * as path from 'path';

// **Validates: Requirements 5.3**

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

const SRC_ROOT = path.resolve(__dirname, '../../src');
const tsFiles = collectTsFiles(SRC_ROOT);

// Matches relative imports that look like model files (e.g. ../../models/user.model)
const RELATIVE_MODEL_IMPORT = /from\s+['"][^'"]*models[^'"]*['"]/g;

describe('Property 3: Data-access imports models only from @office-lunch/shared/models', () => {
  it('no file imports models via a relative path', () => {
    fc.assert(
      fc.property(fc.constantFrom(...tsFiles), (filePath) => {
        const content = readFileSync(filePath, 'utf-8');
        const importLines = content.match(/from\s+['"][^'"]+['"]/g) ?? [];
        return importLines.every((line) => {
          const match = line.match(/from\s+['"]([^'"]+)['"]/);
          if (!match) return true;
          const importPath = match[1];
          // If it references a model file via relative path, that's a violation
          if (importPath.startsWith('.') && importPath.includes('model')) {
            return false;
          }
          return true;
        });
      }),
    );
  });
});
