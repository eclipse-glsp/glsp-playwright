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
import { expect, test } from '@eclipse-glsp/glsp-playwright';
import { WorkflowApp } from '../../src/app/workflow-app';
import { TaskManual } from '../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../src/graph/workflow.graph';

test.describe('Shortcuts', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        graph = app.graph;
    });

    test('should allow deleting the element in the graph', async ({ integration }) => {
        const task = await graph.getNode('[id$="task_Push"]', TaskManual);
        expect(await task.isVisible()).toBeTruthy();

        await task.click();
        await integration.page.keyboard.press('Delete');
        await task.waitFor({ state: 'detached' });

        expect(await task.locate().count()).toBe(0);
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
