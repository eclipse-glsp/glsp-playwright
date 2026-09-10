import glspConfig from '@eclipse-glsp/eslint-config';

/**
 * Import specifiers that resolve to the importing module's own directory barrel or to one of its
 * parent barrels, up to `depth` levels: `'.'`, `'..'`, `'../..'`, ...
 */
function ownAndParentBarrels(depth) {
    return [
        '.',
        ...Array.from({ length: depth }, (_, level) =>
            Array(level + 1)
                .fill('..')
                .join('/')
        )
    ];
}

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
            // The typescript-eslint variant is required for `allowTypeImports` below.
            'no-restricted-imports': 'off',
            '@typescript-eslint/no-restricted-imports': [
                'error',
                {
                    paths: [
                        // `'.'`, `'..'`, `'../..'`, ... resolve to an own or parent barrel, which
                        // re-exports the importing module itself. Type-only is fine, because the
                        // import erases; a value import closes a runtime cycle and yields a
                        // partially initialized module.
                        //
                        // Listed as exact paths rather than a pattern, because
                        // `no-restricted-imports` matches patterns gitignore-style and `'..'` would
                        // then match every relative import. Generated well past the deepest source
                        // directory so that adding a nesting level cannot silently uncover a barrel.
                        ...ownAndParentBarrels(10).map(name => ({
                            name,
                            allowTypeImports: true,
                            message:
                                'Importing an own or parent barrel closes a runtime import cycle. Import the defining ' +
                                'module directly, or keep the import type-only with `import type`.'
                        })),
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
