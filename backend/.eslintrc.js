module.exports = {
    env: {
        node: true,
        es2021: true,
        jest: true,
    },
    extends: [
        'eslint:recommended',
    ],
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    rules: {
        // Regras de formatação
        'indent': ['error', 2],
        'linebreak-style': ['error', 'windows'],
        'quotes': ['error', 'single'],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'always-multiline'],
        'no-trailing-spaces': 'error',
        'eol-last': 'error',

        // Regras de qualidade de código
        'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-alert': 'error',
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',

        // Regras de boas práticas
        'prefer-const': 'error',
        'no-var': 'error',
        'object-shorthand': 'error',
        'prefer-template': 'error',
        'template-curly-spacing': 'error',
        'arrow-spacing': 'error',
        'no-duplicate-imports': 'error',

        // Regras de segurança
        'no-script-url': 'error',

        // Regras específicas para Node.js
        // Removidas temporariamente - plugin não instalado

        // Regras de complexidade
        'complexity': ['warn', 10],
        'max-depth': ['warn', 4],
        'max-lines': ['warn', 300],
        'max-params': ['warn', 4],
    },
    overrides: [
        {
            files: ['**/*.test.js', '**/*.spec.js'],
            env: {
                jest: true,
            },
            rules: {
                'no-console': 'off',
            },
        },
        {
            files: ['**/scripts/**/*.js'],
            rules: {
                'no-console': 'off',
            },
        },
    ],
};
