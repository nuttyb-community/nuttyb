// @ts-check

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import eslint from '@eslint/js';
import { defineConfig } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import eslintPluginProgress from 'eslint-plugin-file-progress';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(
    {
        ignores: [
            'node_modules/',
            '.git/',
            '.github/',
            '.next/',
            'out/**',
            'build/**',
            'coverage/',
            'next-env.d.ts',
            'public/',
            'next.config.mjs',
            'postcss.config.mjs',
            'old/*',
        ],
    },
    {
        settings: {
            tailwindcss: {
                config: `${__dirname}/src/app/globals.css`,
            },
        },
    },
    // Base configurations applied globally
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    eslintPluginReactHooks.configs.flat.recommended,
    ...nextVitals,
    eslintPluginUnicorn.configs.recommended,
    eslintPluginProgress.configs.recommended,
    {
        // Global language options and plugins
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
                ecmaFeatures: {
                    jsx: true,
                },
            },
            ecmaVersion: 'latest',
            sourceType: 'module',
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin,
            prettier: eslintPluginPrettier,
            import: eslintPluginImport,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            // Global rules applied to all files
            'prettier/prettier': 'warn',
            'linebreak-style': ['error', 'unix'],
            quotes: ['error', 'single'],
            semi: ['error', 'always'],
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/restrict-template-expressions': 'off',
            '@typescript-eslint/no-deprecated': 'error',
            'unicorn/no-negated-condition': 'off',
            'unicorn/prevent-abbreviations': 'off',
            'unicorn/switch-case-braces': ['error', 'avoid'],
            'unicorn/no-array-reduce': 'off',
            'unicorn/no-await-expression-member': 'off',
            'unicorn/prefer-set-has': 'off',

            // Disable to allow usage of window.*. May consider enabling in the future.
            'no-undef': 'off',
            'unicorn/prefer-global-this': 'off',

            // Allow overloads
            'no-redeclare': 'off',

            // Allow proper defining of function shapes
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'error',

            // Conflicts with Prettier
            'unicorn/no-nested-ternary': 'off',

            'unicorn/no-null': 'off', // subject to change

            'import/order': [
                'error',
                {
                    groups: ['builtin', 'external', 'internal'],
                    pathGroups: [
                        {
                            pattern: 'react',
                            group: 'external',
                            position: 'before',
                        },
                    ],
                    pathGroupsExcludedImportTypes: ['react'],
                    'newlines-between': 'always',
                    alphabetize: {
                        order: 'asc',
                        caseInsensitive: true,
                    },
                    named: true,
                },
            ],
            'import/no-duplicates': 'error',
            // 'import/no-internal-modules': [
            //     'error',
            //     {
            //         allow: [
            //             'next/*',
            //             'dayjs/**/*',
            //             'motion/react',
            //             'next/font/*',
            //             'public/**/*',
            //             'eslint/*',
            //             'eslint-config-next/*',
            //             '@mantine/*/**',
            //         ],
            //     },
            // ],
        },
    },

    // JS overrides
    {
        files: ['**/*.{js,mjs,cjs,jsx}'],
        ...tseslint.configs.disableTypeChecked,
    },

    // React overrides
    {
        files: ['**/*.{jsx,tsx}'],
        rules: {
            // Only override specific rules for React files
            'no-console': 'warn',
            // Conflicts with Next.js
            '@typescript-eslint/require-await': 'off',
        },
    }
);
