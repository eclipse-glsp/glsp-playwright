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
import { PMetadata, ResizeHandle, expect, test } from '@eclipse-glsp/glsp-playwright';
import { WorkflowApp } from '../../../src/app/workflow-app';
import { TaskManual } from '../../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../../src/graph/workflow.graph';

test.describe('The resizing handle', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        graph = app.graph;
    });

    test('should allow resizing', async () => {
        const task = await graph.getNodeBySelector('[id$="task_Push"]', TaskManual);

        const oldBounds = await task.bounds();
        const oldTopLeft = oldBounds.position('top_left');

        const resizeHandle = await task.resizeHandles().ofKind('top-left');
        const newPosition = oldTopLeft.moveRelative(-50, 0);
        await resizeHandle.dragToAbsolutePosition(newPosition.data);

        const newBounds = await task.bounds();
        expect(newBounds.data.width).toBe(oldBounds.data.width + 50);

        const newTopLeft = newBounds.position('top_left');

        expect(newTopLeft.data.x).toBe(oldTopLeft.data.x - 50);
        expect(newTopLeft.data.y).toBe(oldTopLeft.data.y);
    });

    test('should show 4 handles', async () => {
        const task = await graph.getNodeBySelector('[id$="task_Push"]', TaskManual);

        await graph.waitForCreationOfType(PMetadata.getType(ResizeHandle), async () => {
            await task.click();
        });

        const topLeft = await task.resizeHandles().waitForKind('top-left');
        expect(await topLeft.locate().count()).toBe(1);

        const topRight = await task.resizeHandles().waitForKind('top-right');
        expect(await topRight.locate().count()).toBe(1);

        const bottomLeft = await task.resizeHandles().waitForKind('bottom-left');
        expect(await bottomLeft.locate().count()).toBe(1);

        const bottomRight = await task.resizeHandles().waitForKind('bottom-right');
        expect(await bottomRight.locate().count()).toBe(1);
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
