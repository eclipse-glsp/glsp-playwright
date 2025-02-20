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
import { ActivityNodeFork } from '../../src/graph/elements/activity-node-fork.po';
import { Edge } from '../../src/graph/elements/edge.po';
import { TaskManual } from '../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../src/graph/workflow.graph';
import { TaskManualNodes } from '../nodes';

test.describe('The edge accessor of a connectable element', () => {
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

    test('should allow accessing all edges of a type', async () => {
        const task = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
        const edges = await task.edges().outgoingEdgesOfType(Edge);

        const ids = await Promise.all(edges.map(async e => e.idAttr()));
        const expectedIds = ['edge_task_Push_fork_1'];

        expect(ids.length).toBe(expectedIds.length);
        ids.forEach(id => {
            if (!expectedIds.some(e => id.includes(e))) {
                throw new Error(`${id} is not in the list of expected ids: ${expectedIds}`);
            }
        });
    });

    test('should return typed sources on access', async () => {
        const task = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
        const edges = await task.edges().outgoingEdgesOfType(Edge);
        expect(edges.length).toBe(1);

        const source = await edges[0].source();
        expect(await source.idAttr()).toContain('task_Push');
        expect(source instanceof TaskManual).toBeTruthy();
    });

    test('should allow accessing all edges of a type against a target type', async () => {
        const task = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
        const edges = await task.edges().outgoingEdgesOfType(Edge, { targetConstructor: ActivityNodeFork });
        expect(edges.length).toBe(1);

        const source = await edges[0].source();
        expect(await source.idAttr()).toContain('task_Push');
        expect(source instanceof TaskManual).toBeTruthy();

        const target = await edges[0].target();
        expect(await target.idAttr()).toContain('fork_1');
        expect(target instanceof ActivityNodeFork).toBeTruthy();
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
