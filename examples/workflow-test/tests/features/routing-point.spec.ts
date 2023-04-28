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
import { Edge } from '../../src/graph/elements/edge.po';
import { WorkflowGraph } from '../../src/graph/workflow.graph';

test.describe('The routing points of an edge', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = await GLSPApp.loadApp(WorkflowApp, {
            type: 'integration',
            integration
        });
        graph = app.graph;
    });

    test('should be accessible', async () => {
        const edge = await graph.getEdgeBySelector('[id$="d34c37e0-e45e-4cfe-a76f-0e9274ed8e60"]', Edge);

        const routingPoints = edge.routingPoints();
        expect((await routingPoints.points({ wait: false })).length).toBe(0);
        expect((await routingPoints.volatilePoints({ wait: false })).length).toBe(0);

        await edge.click();

        expect((await routingPoints.points()).length).toBeGreaterThan(0);
        expect((await routingPoints.volatilePoints()).length).toBe(1);
    });

    test('should have the data kind attribute', async () => {
        const edge = await graph.getEdgeBySelector('[id$="d34c37e0-e45e-4cfe-a76f-0e9274ed8e60"]', Edge);

        const routingPoints = edge.routingPoints();
        expect((await routingPoints.volatilePoints({ wait: false })).length).toBe(0);

        await edge.click();

        const points = await routingPoints.volatilePoints();
        expect(points.length).toBe(1);

        const point = points[0];
        expect(await point.dataKindAttr()).toBe('line');
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
