import { tsConfig } from '@aklive2d/eslint-config'
import tseslint from 'typescript-eslint'
import globals from 'globals'

/** @type {import('eslint').Config} */
export default tseslint.config(
    ...tsConfig,
    {
        ignores: ['dist', 'data'],
    },
    {
        files: ['**/*.js', '**/*.ts'],
        languageOptions: {
            ecmaVersion: 2022,
            globals: {
                ...globals.node,
            },
        },
        rules: {
            'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-unused-vars': [
                'error',
                { argsIgnorePattern: '^_' },
            ],
        },
    }
)
