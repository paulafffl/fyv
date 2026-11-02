import js from '@eslint/js';
import globals from 'globals';
import hooks from 'eslint-plugin-react-hooks';

export default [
    {
        ignores: [
            'build/**',
            'playwright-report/**',
            'test-results/**',
            '.parity/**',
            'parity-report/**',
            'parity-results/**',
        ],
    },
    js.configs.recommended,
    {
        files: ['src/**/*.{js,jsx}'],
        languageOptions: {
            globals: globals.browser,
            parserOptions: { ecmaFeatures: { jsx: true } },
        },
        plugins: { 'react-hooks': hooks },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'error',
        },
    },
    {
        files: [
            '*.{cjs,mjs}',
            'e2e/**/*.cjs',
            'tests/**/*.cjs',
            'scripts/**/*.{cjs,mjs}',
        ],
        languageOptions: { globals: globals.node },
    },
    {
        files: ['e2e/**/*.cjs', 'scripts/parity-global-setup.cjs'],
        languageOptions: { globals: globals.browser },
    },
];
