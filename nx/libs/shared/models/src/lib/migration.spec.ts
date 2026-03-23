// Feature: office-lunch-nx, Property 2: All base source files have a migrated equivalent

import * as fc from 'fast-check';
import { existsSync } from 'fs';
import * as path from 'path';

// **Validates: Requirements 13.1**

const MODEL_FILES = [
  'user.model.ts',
  'restaurant.model.ts',
  'order.model.ts',
  'voting.model.ts',
  'departure.model.ts',
  'settings.model.ts',
];

describe('Property 2: All base model files have a migrated equivalent', () => {
  it('every known model filename exists in nx/libs/shared/models/src/lib/', () => {
    fc.assert(
      fc.property(fc.constantFrom(...MODEL_FILES), (filename) => {
        const filePath = path.join(__dirname, filename);
        return existsSync(filePath);
      }),
    );
  });
});
