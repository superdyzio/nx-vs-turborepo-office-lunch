import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  // Libraries
  'libs/shared/models/vitest.config.ts',
  'libs/shared/ui/vitest.config.ts',
  'libs/data-access/vitest.config.ts',
  'libs/auth/vitest.config.ts',
  'libs/util/vitest.config.ts',
  'libs/feature-login/vitest.config.ts',
  'libs/feature-departure/vitest.config.ts',
  'libs/feature-voting/vitest.config.ts',
  'libs/feature-ordering/vitest.config.ts',
  'libs/feature-admin/vitest.config.ts',
  // Shell app
  'apps/office-lunch/vitest.config.ts',
]);
