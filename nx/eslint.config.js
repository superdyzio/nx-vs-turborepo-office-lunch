const nxPlugin = require('@nx/eslint-plugin');

module.exports = [
  ...nxPlugin.configs['flat/typescript'],
  {
    ignores: ['**/vitest.config.ts', '**/vitest.workspace.ts'],
  },
  {
    plugins: {
      '@nx': nxPlugin,
    },
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: [],
            },
            {
              sourceTag: 'scope:data-access',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:auth',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:data-access'],
            },
            {
              sourceTag: 'scope:util',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'scope:feature',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:data-access',
                'scope:auth',
                'scope:util',
              ],
            },
            {
              sourceTag: 'scope:app',
              onlyDependOnLibsWithTags: [
                'scope:shared',
                'scope:data-access',
                'scope:auth',
                'scope:util',
                'scope:feature',
              ],
            },
          ],
        },
      ],
    },
  },
];
