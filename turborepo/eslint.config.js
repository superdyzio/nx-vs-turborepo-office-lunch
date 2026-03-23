export default [
  {
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../../*', '../../../*', '../../../../*'],
              message: 'Use path aliases instead of relative cross-package imports.',
            },
          ],
        },
      ],
    },
  },
];
