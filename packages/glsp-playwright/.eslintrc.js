/** @type {import('eslint').Linter.Config} */
module.exports = {
    extends: '../../.eslintrc.js',
    settings: {
        // Necessary for aliasing paths: https://www.typescriptlang.org/tsconfig#paths
        'import/resolver': {
            typescript: {
                project: ['packages/glsp-playwright/tsconfig.json', 'tsconfig.json']
            }
        }
    },
    rules: {}
};
