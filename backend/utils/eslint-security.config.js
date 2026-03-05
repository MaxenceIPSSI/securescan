'use strict';

const pluginSecurity = require('eslint-plugin-security');
const globals        = require('globals');

module.exports = [
  // Règles recommandées de eslint-plugin-security (passé directement, pas spreadé)
  pluginSecurity.configs.recommended,

  // Surcharge : globals Node.js + règles ESLint standard à risque sécurité
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
        ...globals.commonjs,
        ...globals.browser,
      },
    },
    rules: {
      'no-eval':         'warn',
      'no-new-func':     'warn',
      'no-implied-eval': 'warn',
    },
  },
];
