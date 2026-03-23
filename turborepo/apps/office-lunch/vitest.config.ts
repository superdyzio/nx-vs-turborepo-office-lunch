import { defineConfig } from 'vitest/config';
import { angularInlineResources } from '../../vitest-utils/angular-inline-resources';

export default defineConfig({
  plugins: [angularInlineResources()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
  },
});
