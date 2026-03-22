import { defineConfig } from 'vitest/config';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// Vite plugin to inline Angular templateUrl and styleUrl/styleUrls
function angularInlineResources() {
  return {
    name: 'angular-inline-resources',
    transform(code: string, id: string) {
      if (!id.endsWith('.ts') || !code.includes('templateUrl') && !code.includes('styleUrl')) {
        return null;
      }
      const dir = dirname(id);
      let transformed = code;

      // Inline templateUrl
      transformed = transformed.replace(
        /templateUrl\s*:\s*['"]([^'"]+)['"]/g,
        (_match: string, url: string) => {
          const filePath = resolve(dir, url);
          const content = readFileSync(filePath, 'utf-8').replace(/`/g, '\\`').replace(/\$/g, '\\$');
          return `template: \`${content}\``;
        }
      );

      // Inline styleUrl (single)
      transformed = transformed.replace(
        /styleUrl\s*:\s*['"]([^'"]+)['"]/g,
        (_match: string, url: string) => {
          const filePath = resolve(dir, url);
          const content = readFileSync(filePath, 'utf-8').replace(/`/g, '\\`').replace(/\$/g, '\\$');
          return `styles: [\`${content}\`]`;
        }
      );

      // Inline styleUrls (array)
      transformed = transformed.replace(
        /styleUrls\s*:\s*\[([^\]]+)\]/g,
        (_match: string, urls: string) => {
          const styles = urls
            .split(',')
            .map((u: string) => u.trim().replace(/['"]/g, ''))
            .filter(Boolean)
            .map((url: string) => {
              const filePath = resolve(dir, url);
              const content = readFileSync(filePath, 'utf-8').replace(/`/g, '\\`').replace(/\$/g, '\\$');
              return `\`${content}\``;
            });
          return `styles: [${styles.join(', ')}]`;
        }
      );

      return transformed !== code ? { code: transformed, map: null } : null;
    },
  };
}

export default defineConfig({
  plugins: [angularInlineResources()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
  },
});
