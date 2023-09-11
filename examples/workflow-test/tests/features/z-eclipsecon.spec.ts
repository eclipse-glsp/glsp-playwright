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
import { TaskManual } from '../../src/graph/elements/task-manual.po';

test.describe('At EclipseCon 2023', () => {
    let app: WorkflowApp;

    test.beforeEach(async ({ integration }) => {
        app = await GLSPApp.loadApp(WorkflowApp, { type: 'integration', integration });
    });

    test('we say hello to all attendees', async () => {
        const task = await app.graph.getNodeByLabel('Push', TaskManual);
        await task.dragToRelativePosition({ x: 0, y: 150 });
        await task.rename('Hello');

        const bounds = await task.bounds();
        const targetPosition = bounds.position('top_left').moveRelative(170, 0);

        const newTask = await app.createManualTask(targetPosition);
        await newTask.rename('EclipseCon');

        const edge = await app.createEdge(task, newTask);

        expect(await edge.sourceId()).toBe(await task.idAttr());
        expect(await edge.targetId()).toBe(await newTask.idAttr());
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
