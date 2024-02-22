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

test.describe('The graph', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        graph = app.graph;
    });

    test.describe('should allow accessing the edge', () => {
        test('by using a selector', async () => {
            const edge = await graph.getEdgeBySelector('[id$="d34c37e0-e45e-4cfe-a76f-0e9274ed8e60"]', Edge);
            const task = await edge.sourceOfType(TaskManual);

            expect(await (await task.children.label()).textContent()).toBe('Push');
        });

        test('by using a source type', async () => {
            const edges = await graph.getEdgesOfType(Edge, { sourceConstructor: TaskManual });

            const ids = await Promise.all(edges.map(async e => e.idAttr()));
            const expectedIds = ['d34c37e0-e45e-4cfe-a76f-0e9274ed8e60', 'a36985a7-3e61-499c-9bdb-5be2b00cb75c'];

            expect(ids.length).toBe(expectedIds.length);
            ids.forEach(id => {
                if (!expectedIds.some(e => id.includes(e))) {
                    throw new Error(`${id} is not in the list of expected ids: ${expectedIds}`);
                }
            });
        });

        test('by using a source selector', async () => {
            const edges = await graph.getEdgesOfType(Edge, { sourceSelector: '[id$="task0"]' });
            expect(edges.length).toBe(1);

            const source = await edges[0].sourceOfType(TaskManual);
            expect(await source.idAttr()).toContain('task0');
        });

        test('by using the source type with multiple elements', async () => {
            const edges = await graph.getEdgesOfType(Edge, { sourceConstructor: TaskManual });

            const ids = await Promise.all(edges.map(async e => e.idAttr()));
            const expectedIds = ['d34c37e0-e45e-4cfe-a76f-0e9274ed8e60', 'a36985a7-3e61-499c-9bdb-5be2b00cb75c'];

            expect(ids.length).toBe(expectedIds.length);
            for await (const [index, id] of ids.entries()) {
                expect(await edges[index].source()).toBeInstanceOf(TaskManual);
                if (!expectedIds.some(e => id.includes(e))) {
                    throw new Error(`${id} is not in the list of expected ids: ${expectedIds}`);
                }
            }
        });

        test('by using a target type', async () => {
            const edges = await graph.getEdgesOfType(Edge, { targetConstructor: ActivityNodeFork });

            const ids = await Promise.all(edges.map(async e => e.idAttr()));
            const expectedIds = ['d34c37e0-e45e-4cfe-a76f-0e9274ed8e60'];

            expect(ids.length).toBe(expectedIds.length);
            for await (const [index, id] of ids.entries()) {
                expect(await edges[index].target()).toBeInstanceOf(ActivityNodeFork);
                if (!expectedIds.some(e => id.includes(e))) {
                    throw new Error(`${id} is not in the list of expected ids: ${expectedIds}`);
                }
            }
        });

        test('by using the source and target type', async () => {
            const edges = await graph.getEdgesOfType(Edge, {
                sourceConstructor: TaskManual,
                targetConstructor: ActivityNodeFork
            });

            const ids = await Promise.all(edges.map(async e => e.idAttr()));
            const expectedIds = ['d34c37e0-e45e-4cfe-a76f-0e9274ed8e60'];

            expect(ids.length).toBe(expectedIds.length);
            for await (const [index, id] of ids.entries()) {
                expect(await edges[index].source()).toBeInstanceOf(TaskManual);
                expect(await edges[index].target()).toBeInstanceOf(ActivityNodeFork);
                if (!expectedIds.some(e => id.includes(e))) {
                    throw new Error(`${id} is not in the list of expected ids: ${expectedIds}`);
                }
            }
        });
    });

    test.describe('should allow accessing the node', () => {
        test('semantically by using a label', async () => {
            const task = await graph.getNodeByLabel('Push', TaskManual);

            const label = await task.label;
            expect(label).toBe('Push');
        });

        test('semantically by using a label and throw an error on invalid labels', async () => {
            await expect(graph.getNodeByLabel('Not Existing', TaskManual)).rejects.toThrow();
        });
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
