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

test.describe('Edges', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        graph = app.graph;
    });

    test('should have source and target nodes', async () => {
        const source = await graph.getNodeBySelector('[id$="task0"]', TaskManual);
        const target = await graph.getNodeBySelector('[id$="bb2709f5-0ff0-4438-8853-b7e934b506d7"]', ActivityNodeFork);
        const edge = await graph.getEdgeBySelector('[id$="d34c37e0-e45e-4cfe-a76f-0e9274ed8e60"]', Edge);

        const sourceId = await edge.sourceId();
        expect(sourceId).toBe(await source.idAttr());

        const targetId = await edge.targetId();
        expect(targetId).toBe(await target.idAttr());
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
