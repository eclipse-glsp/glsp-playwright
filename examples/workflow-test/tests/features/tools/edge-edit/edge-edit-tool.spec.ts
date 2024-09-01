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
import { WorkflowApp } from '../../../../src/app/workflow-app';
import { Edge } from '../../../../src/graph/elements/edge.po';
import { TaskAutomated } from '../../../../src/graph/elements/task-automated.po';
import { TaskManual } from '../../../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../../../src/graph/workflow.graph';
import { TaskAutomatedNodes, TaskManualNodes } from '../../../nodes';

test.describe('The edge edit tool', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        graph = app.graph;
    });

    test('should allow reconnecting edges in the graph', async () => {
        const source = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
        const newSource = await graph.getNodeByLabel(TaskAutomatedNodes.chktpLabel, TaskAutomated);
        const newTarget = await graph.getNodeByLabel(TaskAutomatedNodes.chkwtLabel, TaskAutomated);

        const edge = await source.edges().outgoingEdgeOfType(Edge);
        await edge.reconnectTarget(newTarget);
        expect(await edge.targetId()).toBe(await newTarget.idAttr());

        await edge.reconnectSource(newSource);
        expect(await edge.sourceId()).toBe(await newSource.idAttr());
    });

    test('should allow moving the routing points in the graph', async () => {
        const source = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

        const edge = await source.edges().outgoingEdgeOfType(Edge);
        const routingPoints = edge.routingPoints();
        await routingPoints.enable();
        let points = await routingPoints.points();
        const currentPointsLength = points.length;

        let volatilePoints = await routingPoints.volatilePoints();
        expect(volatilePoints).toHaveLength(1);

        const volatilePoint = volatilePoints[0];
        await volatilePoint.dragToRelativePosition({ x: 50, y: 50 });

        points = await routingPoints.points();
        expect(points).toHaveLength(currentPointsLength + 1);

        volatilePoints = await routingPoints.volatilePoints();
        expect(volatilePoints).toHaveLength(2);
    });

    test('should allow removing the routing points in the graph by realigning', async () => {
        const source = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

        const edge = await source.edges().outgoingEdgeOfType(Edge);
        const routingPoints = edge.routingPoints();
        await routingPoints.enable();
        let points = await routingPoints.points();
        const currentPointsLength = points.length;

        let volatilePoints = await routingPoints.volatilePoints();
        expect(volatilePoints).toHaveLength(1);

        // Middle one
        await volatilePoints[0].dragToRelativePosition({ x: 0, y: 50 });

        points = await routingPoints.points();
        expect(points).toHaveLength(currentPointsLength + 1);

        volatilePoints = await routingPoints.volatilePoints();
        expect(volatilePoints).toHaveLength(2);

        // Junction
        const junction = points.find(p => p.lastSnapshot?.kind === 'junction')!;
        await junction.dragToRelativePosition({ x: 20, y: -40 });
        await junction.waitForHidden();

        points = await routingPoints.points();
        expect(points).toHaveLength(currentPointsLength);

        volatilePoints = await routingPoints.volatilePoints();
        expect(volatilePoints).toHaveLength(1);
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
