import { defineConfig } from 'vitest/config';
import { angularInlineResources } from '../../vitest-utils/angular-inline-resources';
import { resolve } from 'path';

export default defineConfig({
  plugins: [angularInlineResources()],
  resolve: {
    alias: {
      '@office-lunch/auth': resolve(__dirname, '../../libs/auth/index.ts'),
      '@office-lunch/shared/ui': resolve(__dirname, '../../libs/shared/ui/index.ts'),
      '@office-lunch/shared/models': resolve(__dirname, '../../libs/shared/models/index.ts'),
      '@office-lunch/data-access': resolve(__dirname, '../../libs/data-access/index.ts'),
      '@office-lunch/util': resolve(__dirname, '../../libs/util/index.ts'),
      '@office-lunch/feature-login': resolve(__dirname, '../../libs/feature-login/index.ts'),
      '@office-lunch/feature-departure': resolve(__dirname, '../../libs/feature-departure/index.ts'),
      '@office-lunch/feature-voting': resolve(__dirname, '../../libs/feature-voting/index.ts'),
      '@office-lunch/feature-ordering': resolve(__dirname, '../../libs/feature-ordering/index.ts'),
      '@office-lunch/feature-admin': resolve(__dirname, '../../libs/feature-admin/index.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    root: resolve(__dirname, '.'),
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
  },
});
