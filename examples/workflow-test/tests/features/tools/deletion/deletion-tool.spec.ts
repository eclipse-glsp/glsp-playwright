/********************************************************************************
 * Copyright (c) 2023-2025 Business Informatics Group (TU Wien) and others.
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
import { expect, test } from '@eclipse-glsp/glsp-playwright';
import { WorkflowApp } from '../../../../src/app/workflow-app';
import { WorkflowToolPalette } from '../../../../src/features/tool-palette/workflow-tool-palette';
import { TaskManual } from '../../../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../../../src/graph/workflow.graph';
import { TaskManualNodes } from '../../../nodes';

test.describe('The deletion tool', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;
    let toolPalette: WorkflowToolPalette;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        await app.waitForReady();
        graph = app.graph;
        toolPalette = app.toolPalette;
    });

    test('should allow deleting elements in the graph by mouse', async () => {
        await toolPalette.toolbar.deletionTool().click();

        const task = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
        expect(await task.isVisible()).toBeTruthy();

        await task.click();
        await task.waitFor({ state: 'detached' });

        expect(await task.locate().count()).toBe(0);
    });

    test('should allow deleting elements in the graph by keyboard', async () => {
        const task = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

        expect(await task.locate().count()).toBe(1);
        await task.delete();
        expect(await task.locate().count()).toBe(0);
    });

    test('should allow deleting elements in the graph', async () => {
        const task = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

        expect(await task.locate().count()).toBe(1);
        await task.delete();
        expect(await task.locate().count()).toBe(0);
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
