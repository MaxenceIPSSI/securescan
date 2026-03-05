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
      // Trop de faux positifs : flags tout obj[key] et tout fs.*(variable)
      // sans considérer le contexte. Les vrais cas sont couverts par semgrep.
      'security/detect-object-injection':       'off',
      'security/detect-non-literal-fs-filename': 'off',
    },
  },
];
