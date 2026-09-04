import glspConfig from '@eclipse-glsp/eslint-config';

export default [
    ...glspConfig,
    {
        ignores: [
            '**/*.js',
            '**/*.mjs',
            '**/*.cjs',
            '**/dist/',
            '**/lib/',
            // Both spellings: `.repositories/` is the current clone target, `repositories/` a legacy one.
            '**/.repositories/',
            '**/repositories/',
            '**/.vscode-test/',
            '**/*.map',
            '.worktrees/'
        ]
    },
    {
        files: ['**/*.{ts,tsx,mts}'],
        languageOptions: {
            parserOptions: {
                project: './tsconfig.eslint.json',
                tsconfigRootDir: import.meta.dirname
            }
        },
        rules: {
            '@typescript-eslint/no-floating-promises': 'error',
            'no-null/no-null': 'off',
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: 'sprotty',
                            message:
                                "The sprotty default exports are customized and reexported by GLSP. Please use '@eclipse-glsp/client' instead"
                        },
                        {
                            name: 'sprotty-protocol',
                            message:
                                "The sprotty default exports are customized and reexported by GLSP. Please use '@eclipse-glsp/client' instead"
                        }
                    ],
                    patterns: [
                        { group: ['**/../index'] },
                        {
                            group: [
                                // Matches each core package and its integration packages.
                                '@eclipse-glsp/playwright*/src/**',
                                '@eclipse-glsp/playwright*/lib/**',
                                '@eclipse-glsp/workflow*/src/**',
                                '@eclipse-glsp/workflow*/lib/**'
                            ],
                            message:
                                'Import from the package root instead. Deep imports are resolved by the Playwright require hook ' +
                                'and load a second copy of the module graph. If a symbol is unreachable, export it from the barrel.'
                        }
                    ]
                }
            ]
        },
        settings: {
            'import-x/resolver': {
                typescript: {
                    project: 'tsconfig.json'
                }
            }
        }
    }
];
