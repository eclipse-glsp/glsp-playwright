/********************************************************************************
 * Copyright (c) 2024-2026 EclipseSource and others.
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
import { GLSPContextMenu, expect, test } from '@eclipse-glsp/playwright';
import { WorkflowApp } from '../../../src/app/workflow-app';

test.describe('The context menu', () => {
    let app: WorkflowApp;
    let contextMenu: GLSPContextMenu;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        await app.waitForReady();
        contextMenu = app.contextMenu;
    });

    // Integrations that do provide a context menu exclude this file; see the `theia` project.
    test('should throw an error if the integration does not support it', async () => {
        expect(() => contextMenu.open()).toThrow();
    });
});
