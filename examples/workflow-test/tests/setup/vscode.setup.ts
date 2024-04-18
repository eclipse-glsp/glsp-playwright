/********************************************************************************
 * Copyright (c) 2023 EclipseSource and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import { IntegrationOptions, VSCodeIntegrationOptions, VSCodeStorage, expect, setup } from '@eclipse-glsp/glsp-playwright';

const VSCODE_VERSION = process.env['VSCODE_VERSION'] ?? '1.88.1';

setup.describe.configure({
    mode: 'serial'
});

function assertVSCodeOptions(options?: IntegrationOptions): asserts options is VSCodeIntegrationOptions {
    if (options === undefined || options.type !== 'VSCode') {
        throw new Error('This setup can only be executed by VS Code integrations');
    }
}

setup.describe('Setup VSCode', () => {
    setup('Download VSCode', async ({ vscodeSetup, integrationOptions }) => {
        assertVSCodeOptions(integrationOptions);
        expect(vscodeSetup).toBeDefined();

        const vscodeExecutablePath = await vscodeSetup!.downloadVSCode(VSCODE_VERSION);

        await VSCodeStorage.write(integrationOptions.storagePath, { vscodeExecutablePath });
    });

    setup('Install extension', async ({ vscodeSetup, integrationOptions }) => {
        assertVSCodeOptions(integrationOptions);
        expect(vscodeSetup).toBeDefined();

        const vscodeExecutablePath = (await VSCodeStorage.read(integrationOptions.storagePath)).vscodeExecutablePath;

        await vscodeSetup!.install({
            vscodeExecutablePath
        });
    });
});
