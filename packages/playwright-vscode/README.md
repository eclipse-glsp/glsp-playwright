# @eclipse-glsp/playwright-vscode

VS Code integration for the [GLSP Playwright](../playwright/README.md) testing framework.

Use this package to test a GLSP diagram editor running inside a VS Code extension.
It contributes the `VSCode` integration, its workbench page objects, and the setup
helpers that download VS Code and install the extension under test; everything else comes
from `@eclipse-glsp/playwright`.

## Usage

Create the integration options with `defineVSCodeIntegration()` in your Playwright
configuration. The returned options carry the factory that the `integration` fixture uses,
so no further registration is needed:

```ts
import { defineVSCodeIntegration } from '@eclipse-glsp/playwright-vscode';

const integrationOptions = defineVSCodeIntegration({
    workspace: '../workspace',
    file: 'example1.wf',
    vsixId: 'publisher.extension',
    vsixPath: '/path/to/extension.vsix',
    storagePath: '/path/to/playwright/.storage/vscode.setup.json'
});
```

Downloading VS Code and installing the extension is done by a dedicated setup project that
the main project depends on. The setup spec imports `setup` from this package, which adds the
`vscodeSetup` fixture:

```ts
import { VSCodeIntegrationOptions, VSCodeStorage, setup } from '@eclipse-glsp/playwright-vscode';

setup('Download VSCode', async ({ vscodeSetup, integrationOptions }) => {
    VSCodeIntegrationOptions.assert(integrationOptions);
    const vscodeExecutablePath = await vscodeSetup.downloadVSCode('1.101.0');
    await VSCodeStorage.write(integrationOptions.storagePath, { vscodeExecutablePath });
});
```

Tests themselves stay integration-agnostic and keep importing `test` and `expect` from
`@eclipse-glsp/playwright`.

## License

This program and the accompanying materials are made available under the terms of the
[Eclipse Public License v. 2.0](http://www.eclipse.org/legal/epl-2.0) which is available at
https://www.eclipse.org/legal/epl-2.0, or the
[GNU General Public License, version 2](https://www.gnu.org/software/classpath/license.html)
with the GNU Classpath Exception.

SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
