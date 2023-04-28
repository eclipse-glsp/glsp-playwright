/** @type {import('eslint').Linter.Config} */
module.exports = {
    root: true,
    extends: ['@eclipse-glsp'],
    ignorePatterns: ['**/{node_modules,lib}', '**/.eslintrc.js'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: 'tsconfig.eslint.json'
    },
    settings: {
        // Necessary for aliasing paths: https://www.typescriptlang.org/tsconfig#paths
        'import/resolver': {
            typescript: {
                project: ['packages/glsp-playwright/tsconfig.json', 'tsconfig.json']
            }
        }
    },
    rules: {
        'no-null/no-null': 'off', // Accessing the browser DOM returns "null" instead of "undefined"
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
                            "The sprotty-protocol default exports are customized and reexported by GLSP. Please use '@eclipse-glsp/client' instead"
                    }
                ],
                patterns: ['../../../../*', '**/../index']
            }
        ]
    }
};
