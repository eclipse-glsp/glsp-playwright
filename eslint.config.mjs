import glspConfig from '@eclipse-glsp/eslint-config';

export default [
    ...glspConfig,
    {
        ignores: ['**/*.js', '**/*.mjs', '**/*.cjs', '**/dist/', '**/lib/', '**/repositories/', '**/*.map']
    },
    {
        files: ['**/*.{ts,tsx}'],
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
                    patterns: ['**/../index']
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
