import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import eslint from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import header from '@tony.ganchev/eslint-plugin-header';
import noNull from 'eslint-plugin-no-null';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

const getRules = configArray => {
    let rules = {};

    const addRulesFromObject = config => {
        if (config.hasOwnProperty('rules')) {
            rules = {
                ...rules,
                ...config.rules,
            };
        }
    };

    if (Array.isArray(configArray)) {
        for (const config of configArray) {
            addRulesFromObject(config);
        }
    } else {
        addRulesFromObject(configArray);
    }

    return rules;
};

const rules = {
    ...getRules(eslint.configs.recommended),
    ...getRules(tseslint.configs.recommended),
    ...{
        'no-irregular-whitespace': 0,
        semi: [2, 'always'],
        'react/display-name': 0,
        'react/react-in-jsx-scope': 0,
        'no-prototype-builtins': 0,

        '@typescript-eslint/no-unused-vars': [
            'error',
            {
                ignoreRestSiblings: true,
            },
        ],

        '@typescript-eslint/no-explicit-any': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 0,
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-empty-function': 'error',
        '@typescript-eslint/no-var-requires': 'error',
        '@typescript-eslint/ban-ts-comment': 0,
        "@typescript-eslint/no-empty-interface": 0,
        "@typescript-eslint/no-empty-object-type": 0,

        '@tony.ganchev/header': [
            2,
            'line',
            [
                ' Copyright (c) Cratis. All rights reserved.',
                ' Licensed under the MIT license. See LICENSE file in the project root for full license information.'
            ],
            1
        ],
    },
};

// Seam invariants from UIPlan/01-foundations-architecture.md §3 (I3, I4).
//
// I3 — the engine and the model have no framework or DOM dependency. The engine is pure functions over the
// model so its behaviour can be asserted without a DOM, and so a non-React renderer inherits correct
// semantics rather than reimplementing them. Enforced by ADR-005 and ADR-006.
//
// I4 — no URL string is constructed outside a renderer package. The model declares `navigate to <Screen>`;
// deciding that this means `/invoicing/invoices` is renderer work, per ADR-004. A route-template literal in
// `model/` or `engine/` means that decision has leaked down a layer.
const seamRestrictedPackages = [
    { name: 'react', message: 'I3: the engine and the model are framework-neutral. Move React usage into a renderer package such as @cratis/scene.react.' },
    { name: 'react-dom', message: 'I3: the engine and the model are framework-neutral. Move React usage into a renderer package such as @cratis/scene.react.' },
    { name: '@cratis/scene.react', message: 'I3: the engine and the model must not depend on a renderer. The dependency runs the other way.' },
];

const seamRestrictedGlobals = [
    'window',
    'document',
    'navigator',
    'location',
    'history',
    'localStorage',
    'sessionStorage',
    'fetch',
    'XMLHttpRequest',
    'alert',
    'confirm',
].map(name => ({
    name,
    message: `I3: '${name}' is a host environment API. The engine and the model must run without a DOM — take it as an injected seam (a transport, a dispatcher, a store) supplied by the renderer.`,
}));

const routeLiteralMessage =
    'I4: no URL is constructed outside a renderer package. The model and the engine deal in screen references and parameter maps; a renderer turns those into a path (ADR-004).';

const seamConfig = [
    {
        files: ['Source/JavaScript/engine/**/*.ts', 'Source/JavaScript/model/**/*.ts'],
        languageOptions: {
            globals: {},
        },
        rules: {
            'no-restricted-imports': ['error', { paths: seamRestrictedPackages }],
            'no-restricted-globals': ['error', ...seamRestrictedGlobals],
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'Literal[value=/^\\//]',
                    message: routeLiteralMessage,
                },
                {
                    // A relative route template — caught separately so it is reported once, not twice.
                    selector: 'Literal[value=/^[^/].*\\/:/]',
                    message: routeLiteralMessage,
                },
                {
                    selector: 'TemplateElement[value.raw=/^\\//]',
                    message: routeLiteralMessage,
                },
            ],
        },
    },
];

const reactCompat = compat.extends('plugin:react/recommended');
const reactPlugin = reactCompat[0].plugins.react;

const defaultConfig = [
    {
        ignores: [
            '**/*.d.ts',
            '**/*.scss.d.ts',
            '**/tsconfig.*',
            '**/wallaby.js',
            '**/*.js',
            '**/dist/**',
            '**/node_modules/**',
            '**/wwwroot/**',
            '**/templates/**',
            '**/Api/**',
            '**/rollup.config.mjs'
        ],
    },
    {
        files: ['**/*.ts', '**/*.tsx'],

        plugins: {
            '@typescript-eslint': typescriptEslint,
            react: reactPlugin,
            '@tony.ganchev': header,
            'no-null': noNull
        },

        rules: rules,

        languageOptions: {
            globals: {
                ...globals.browser,
            },
            parser: tsParser,
            sourceType: 'module',
        },

        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        files: ['**/for_*/**/*.ts'],
        rules: {
            '@typescript-eslint/naming-convention': 0,
            '@typescript-eslint/no-unused-expressions': 0,
            "@typescript-eslint/no-empty-function": "off",
            'no-restricted-globals': 0,
        },
    },
    ...seamConfig,
];

const config = tseslint.config(...defaultConfig);
export default config;
