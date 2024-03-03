const concurrently = require('concurrently');
const { result } = concurrently(
    [
        { command: 'tsc -b -w --preserveWatchOutput', name: 'tsc', prefixColor: 'blue' },
        { command: 'yarn --cwd packages/glsp-playwright tsc-alias -w', name: 'tsc-alias', prefixColor: 'yellow' }
    ],
    {
        killOthers: ['failure', 'success']
    }
);
result.then(
    () => {},
    () => {
        console.error('One or more commands failed');
    }
);