import js from '@eslint/js'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'
import tsConfig from './ts.js'

export default [
    { ignores: ['dist'] },
    {
        files: ['**/*.{js,jsx}', '**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        rules: {
            ...js.configs.recommended.rules,
        },
    },
    eslintPluginPrettierRecommended,
]

export { tsConfig }
