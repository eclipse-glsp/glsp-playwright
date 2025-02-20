/********************************************************************************
 * Copyright (c) 2023 Business Informatics Group (TU Wien) and others.
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
import { expect, test } from '@eclipse-glsp/glsp-playwright/';
import { WorkflowApp } from '../../../src/app/workflow-app';
import { TaskAutomated } from '../../../src/graph/elements/task-automated.po';
import { WorkflowGraph } from '../../../src/graph/workflow.graph';

const label = 'ChkWt';
const expectedAutomatedPopupText = 'INFO: This is an automated task';

test.describe('The marker', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        await app.waitForReady();
        graph = app.graph;
    });

    test('should be shown after validation', async () => {
        await app.toolPalette.toolbar.validateTool().trigger();
        const task = await graph.getNodeByLabel(label, TaskAutomated);

        const marker = task.marker();
        await expect(marker.locate()).toBeVisible();
    });

    test('should show a popup on hover', async () => {
        await app.toolPalette.toolbar.validateTool().trigger();
        const task = await graph.getNodeByLabel(label, TaskAutomated);
        expect(await task.marker().popupText()).toBe(expectedAutomatedPopupText);
    });

    test('should be still visible after resizing', async () => {
        await app.toolPalette.toolbar.validateTool().trigger();
        const task = await graph.getNodeByLabel(label, TaskAutomated);
        expect(await task.marker().popupText()).toBe(expectedAutomatedPopupText);

        await app.popup.close();
        await expect(task.popup().locate()).toBeHidden();

        const handle = await task.resizeHandles().ofKind('top-left');
        await handle.dragToRelativePosition({ x: 10, y: 10 });
        expect(await task.marker().popupText()).toBe(expectedAutomatedPopupText);
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
