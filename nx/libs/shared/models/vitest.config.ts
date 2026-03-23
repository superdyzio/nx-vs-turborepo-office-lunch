import { defineConfig } from 'vitest/config';
import { angularInlineResources } from '../../../vitest-utils/angular-inline-resources';
import { resolve } from 'path';

export default defineConfig({
  plugins: [angularInlineResources()],
  test: {
    globals: true,
    environment: 'jsdom',
    root: resolve(__dirname, '.'),
    include: ['src/**/*.spec.ts'],
  },
});
