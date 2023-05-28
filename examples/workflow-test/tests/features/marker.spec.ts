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
import { GLSPApp } from '@eclipse-glsp/glsp-playwright/glsp';
import { expect, test } from '@eclipse-glsp/glsp-playwright/test';
import { WorkflowApp } from '../../src/app/workflow-app';
import { TaskAutomated } from '../../src/graph/elements/task-automated.po';
import { WorkflowGraph } from '../../src/graph/workflow.graph';

test.describe('The marker', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = await GLSPApp.loadApp(WorkflowApp, {
            type: 'integration',
            integration
        });
        graph = app.graph;
    });

    test('should show a popup on hover', async () => {
        const task = await graph.getNodeBySelector('[id$="task0_automated"]', TaskAutomated);

        await app.toolPalette.toolbar.validateTool().click();

        const marker = task.marker();
        await marker.hover();

        const text = await marker.popup().innerText();
        expect(text).toBe('INFO: This is an automated task');
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
