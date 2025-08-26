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
import { provideUndoRedoTriggerVariable, UndoRedoTrigger } from '@eclipse-glsp/glsp-playwright/src/glsp';
import { skipIntegration } from '@eclipse-glsp/glsp-playwright/src/test';
import { WorkflowApp } from '../../../src/app/workflow-app';
import { TaskManual } from '../../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../../src/graph/workflow.graph';
import { TaskManualNodes } from '../../nodes';

test.describe('The undo redo trigger', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;
    let trigger: UndoRedoTrigger;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        await app.waitForReady();
        graph = app.graph;
        trigger = provideUndoRedoTriggerVariable(integration, app).get();
    });

    test.skip(({ integrationOptions }) => skipIntegration(integrationOptions, 'VSCode'), 'TODO: Keyboard event not handled in VSCode');

    test('should allow undo and redo', async () => {
        await expect(graph).toContainElement({ type: TaskManual, query: { label: TaskManualNodes.pushLabel } });

        const node = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
        await node.delete();

        await expect(graph).not.toContainElement({ type: TaskManual, query: { label: TaskManualNodes.pushLabel } });

        await trigger.undo();

        await expect(graph).toContainElement({ type: TaskManual, query: { label: TaskManualNodes.pushLabel } });

        await trigger.redo();

        await expect(graph).not.toContainElement({ type: TaskManual, query: { label: TaskManualNodes.pushLabel } });
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
