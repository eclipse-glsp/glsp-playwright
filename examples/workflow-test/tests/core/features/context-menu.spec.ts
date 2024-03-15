/********************************************************************************
 * Copyright (c) 2024 EclipseSource and others.
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
import { GLSPContextMenu, expect, skipIntegration, skipNonIntegration, test } from '@eclipse-glsp/glsp-playwright/';
import { WorkflowApp } from '../../../src/app/workflow-app';

test.describe('The context menu', () => {
    let app: WorkflowApp;
    let contextMenu: GLSPContextMenu;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        contextMenu = app.contextMenu;
    });

    test('should throw an error if the integration does not support it', async ({ integrationOptions }) => {
        test.skip(skipIntegration(integrationOptions, 'Theia'));

        expect(() => contextMenu.open()).toThrow();
    });

    test('should allow to open the context menu', async ({ integrationOptions }) => {
        test.skip(skipNonIntegration(integrationOptions, 'Theia'));

        await contextMenu.open();
        await expect(contextMenu.locate()).toBeVisible();
    });

    test('should allow to close the context menu', async ({ integrationOptions }) => {
        test.skip(skipNonIntegration(integrationOptions, 'Theia'));

        await contextMenu.open();
        await expect(contextMenu.locate()).toBeVisible();
        await contextMenu.close();
        await expect(contextMenu.locate()).toBeHidden();
    });
});
