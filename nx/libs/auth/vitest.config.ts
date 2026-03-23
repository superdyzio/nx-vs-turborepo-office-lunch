import { defineConfig } from 'vitest/config';
import { angularInlineResources } from '../../vitest-utils/angular-inline-resources';
import { resolve } from 'path';

export default defineConfig({
  plugins: [angularInlineResources()],
  resolve: {
    alias: {
      '@office-lunch/shared/models': resolve(__dirname, '../shared/models/index.ts'),
      '@office-lunch/data-access': resolve(__dirname, '../data-access/index.ts'),
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
