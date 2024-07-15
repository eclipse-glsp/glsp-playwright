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
import { WorkflowApp } from '../../src/app/workflow-app';
import { LabelHeading } from '../../src/graph/elements/label-heading.po';
import { TaskManual } from '../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../src/graph/workflow.graph';

test.describe('The children accessor of a parent element', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        graph = app.graph;
    });

    test('should allow to access all elements by using a type', async () => {
        const task = await graph.getNodeBySelector('[id$="task_Push"]', TaskManual);
        const children = task.children;

        const labels = await children.allOfType(LabelHeading);
        expect(labels.length).toBe(1);

        const label = labels[0];
        expect(await label.textContent()).toBe('Push');
    });

    test('should allow to access the element by using a type', async () => {
        const task = await graph.getNodeBySelector('[id$="task_Push"]', TaskManual);
        const children = task.children;

        const label = await children.ofType(LabelHeading);
        expect(await label.textContent()).toBe('Push');
    });

    test('should allow to access the element by using a type and a selector', async () => {
        const task = await graph.getNodeBySelector('[id$="task_Push"]', TaskManual);
        const children = task.children;

        const label = await children.ofType(LabelHeading, { selector: '[id$="task_Push_label"]' });
        expect(await label.textContent()).toBe('Push');
    });

    test('should allow to use typed elements', async () => {
        const task = await graph.getNodeBySelector('[id$="task_Push"]', TaskManual);
        const children = task.children;

        const label = await children.label();
        expect(await label.textContent()).toBe('Push');
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
