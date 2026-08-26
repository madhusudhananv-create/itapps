export default {
  extends: [],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'FIX',
        'FEATURE',
        'DOCS',
        'STYLE',
        'REFACTOR',
        'PERF',
        'TEST',
        'CHORE',
        'REVERT',
        'CI',
        'BUILD',
      ],
    ],
    'type-case': [2, 'always', 'upper-case'],
    'type-empty': [2, 'never'],
    'scope-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-max-length': [2, 'always', 50],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 200],
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [2, 'always'],
  },
  parserPreset: {
    parserOpts: {
      headerPattern: /^([A-Z]+):\s*\(([a-z.-]+(?:[ \t][a-z.-]+)*)\)\s*-\s*(.+)$/,
      headerCorrespondence: ['type', 'scope', 'subject'],
    },
  },
};
