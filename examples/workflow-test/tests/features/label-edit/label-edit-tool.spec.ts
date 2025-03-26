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
import { WorkflowApp } from '../../../src/app/workflow-app';
import { TaskManual } from '../../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../../src/graph/workflow.graph';
import { TaskManualNodes } from '../../nodes';

test.describe('The label edit tool', () => {
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

    test('should allow nodes to be renamed', async () => {
        const node = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

        await node.rename('New Label');
        expect(await node.label).toBe('New Label');
    });

    test('should allow nodes to be renamed by using the keyboard', async () => {
        const node = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

        await node.click();
        await node.page.keyboard.press('F2');
        await node.page.keyboard.type('New Label');
        await node.page.keyboard.press('Enter');
        await app.labelEditor.waitForHidden();

        expect(await node.label).toBe('New Label');
    });

    test('should not allow empty text', async () => {
        const node = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

        await node.click();
        await node.page.keyboard.press('F2');
        await node.page.keyboard.type(' ');
        await node.page.keyboard.press('Backspace');
        await node.page.keyboard.press('Enter');

        expect(await app.labelEditor.getWarning()).toBe('Name must not be empty');
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
