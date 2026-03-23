// Feature: office-lunch-turborepo, Property 2: All base source files have a migrated equivalent

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Validates: Requirements 13.1
 *
 * Property 2 (full workspace): For every .ts, .html, .scss, and .spec.ts file
 * present in base/src/, there SHALL exist a corresponding file in the
 * turborepo/ workspace at the expected mapped path.
 */

const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../../..');

const BASE_SRC = path.join(WORKSPACE_ROOT, 'base/src');

// ─── Migration mapping ────────────────────────────────────────────────────────
// Each entry maps a base/src/ prefix to a turborepo/ destination prefix.
// Entries are ordered from most-specific to least-specific so the first match wins.

interface MappingRule {
  basePrefix: string;   // relative to base/src/
  turboPrefix: string;  // relative to turborepo/
}

const MAPPING_RULES: MappingRule[] = [
  // Models
  { basePrefix: 'app/models/', turboPrefix: 'packages/shared-models/src/lib/' },

  // Shared UI components
  { basePrefix: 'app/shared/components/', turboPrefix: 'packages/shared-ui/src/lib/' },

  // Shared styles
  { basePrefix: 'styles/', turboPrefix: 'packages/shared-ui/src/styles/' },

  // LocalStorageService (must come before generic services/ rule)
  { basePrefix: 'app/services/local-storage.service', turboPrefix: 'packages/data-access/src/lib/local-storage.service' },

  // Repositories
  { basePrefix: 'app/services/repositories/', turboPrefix: 'packages/data-access/src/lib/repositories/' },

  // AuthService (must come before generic services/ rule)
  { basePrefix: 'app/services/auth.service', turboPrefix: 'packages/auth/src/lib/auth.service' },

  // Guards
  { basePrefix: 'app/guards/', turboPrefix: 'packages/auth/src/lib/' },

  // Helpers
  { basePrefix: 'app/helpers/', turboPrefix: 'packages/util/src/lib/' },

  // Feature: login
  { basePrefix: 'app/features/login/', turboPrefix: 'packages/feature-login/src/lib/login/' },

  // Feature: departure
  { basePrefix: 'app/features/departure/', turboPrefix: 'packages/feature-departure/src/lib/departure/' },

  // Feature: voting
  { basePrefix: 'app/features/voting/', turboPrefix: 'packages/feature-voting/src/lib/voting/' },

  // Feature: ordering
  { basePrefix: 'app/features/ordering/', turboPrefix: 'packages/feature-ordering/src/lib/ordering/' },

  // Feature: admin sub-features
  { basePrefix: 'app/features/admin/dashboard/', turboPrefix: 'packages/feature-admin/src/lib/dashboard/' },
  { basePrefix: 'app/features/admin/menu-management/', turboPrefix: 'packages/feature-admin/src/lib/menu-management/' },
  { basePrefix: 'app/features/admin/settings/', turboPrefix: 'packages/feature-admin/src/lib/settings/' },
  { basePrefix: 'app/features/admin/user-management/', turboPrefix: 'packages/feature-admin/src/lib/user-management/' },

  // Shell app files (app.* files)
  { basePrefix: 'app/app.', turboPrefix: 'apps/office-lunch/src/app/app.' },

  // Root src files
  { basePrefix: 'main.ts', turboPrefix: 'apps/office-lunch/src/main.ts' },
  { basePrefix: 'index.html', turboPrefix: 'apps/office-lunch/src/index.html' },
  { basePrefix: 'styles.scss', turboPrefix: 'apps/office-lunch/src/styles.scss' },
  { basePrefix: 'test-setup.ts', turboPrefix: 'apps/office-lunch/src/test-setup.ts' },
];

// ─── File collection ──────────────────────────────────────────────────────────

const RELEVANT_EXTENSIONS = ['.ts', '.html', '.scss'];

/** Recursively collect all relevant source files under a directory. */
function collectSourceFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectSourceFiles(fullPath));
    } else if (entry.isFile() && RELEVANT_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

/** Convert an absolute base/src path to a relative path (using forward slashes). */
function toRelative(absPath: string): string {
  return path.relative(BASE_SRC, absPath).replace(/\\/g, '/');
}

/**
 * Given a relative path from base/src/, return the expected absolute turborepo path.
 * Returns null if no mapping rule matches (file is intentionally not migrated).
 */
function mapToTurboPath(relPath: string): string | null {
  for (const rule of MAPPING_RULES) {
    if (relPath.startsWith(rule.basePrefix)) {
      const suffix = relPath.slice(rule.basePrefix.length);
      // For prefix rules that already include the full filename (no trailing slash),
      // the suffix is the remainder after the matched prefix.
      const turboRel = rule.turboPrefix + suffix;
      return path.join(WORKSPACE_ROOT, 'turborepo', turboRel);
    }
  }
  return null;
}

// ─── Files to exclude from the check ─────────────────────────────────────────
// These base files are intentionally not migrated 1-to-1 (e.g. barrel files
// that are replaced by the turborepo package structure).
const EXCLUDED_BASE_RELATIVE_PATHS = new Set([
  'app/shared/index.ts',   // replaced by packages/shared-ui/index.ts barrel
]);

// ─── Build the list of (baseFile, expectedTurboPath) pairs ───────────────────

interface FilePair {
  baseRelPath: string;
  expectedTurboPath: string;
}

function buildFilePairs(): FilePair[] {
  const allBaseFiles = collectSourceFiles(BASE_SRC);
  const pairs: FilePair[] = [];

  for (const absBase of allBaseFiles) {
    const rel = toRelative(absBase);

    if (EXCLUDED_BASE_RELATIVE_PATHS.has(rel)) {
      continue;
    }

    const turboPath = mapToTurboPath(rel);
    if (turboPath !== null) {
      pairs.push({ baseRelPath: rel, expectedTurboPath: turboPath });
    }
  }

  return pairs;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Property 2: All base source files have a migrated equivalent (full workspace)', () => {
  let filePairs: FilePair[];

  beforeAll(() => {
    filePairs = buildFilePairs();
  });

  it('base/src/ contains source files to check', () => {
    expect(filePairs.length).toBeGreaterThan(0);
  });

  it('every base source file has a corresponding migrated file in turborepo/', () => {
    expect(filePairs.length).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.constantFrom(...filePairs),
        ({ baseRelPath, expectedTurboPath }: FilePair) => {
          const exists = fs.existsSync(expectedTurboPath);
          if (!exists) {
            const turboRel = path.relative(path.join(WORKSPACE_ROOT, 'turborepo'), expectedTurboPath).replace(/\\/g, '/');
            throw new Error(
              `Missing migrated file for "base/src/${baseRelPath}" — expected at "turborepo/${turboRel}"`
            );
          }
          return true;
        }
      ),
      { numRuns: filePairs.length }
    );
  });
});
