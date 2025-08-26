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
import { CursorCSS } from '@eclipse-glsp/client/lib/base/feedback/css-feedback';
import { expect, test } from '@eclipse-glsp/glsp-playwright';
import { WorkflowApp } from '../../../../src/app/workflow-app';
import { WorkflowToolPalette } from '../../../../src/features/tool-palette/workflow-tool-palette';
import { ActivityNodeDecision } from '../../../../src/graph/elements/activity-node-decision.po';
import { Edge } from '../../../../src/graph/elements/edge.po';
import { TaskAutomated } from '../../../../src/graph/elements/task-automated.po';
import { TaskManual } from '../../../../src/graph/elements/task-manual.po';
import { WeightedEdge } from '../../../../src/graph/elements/weighted-edge.po';
import { WorkflowGraph } from '../../../../src/graph/workflow.graph';
import { TaskAutomatedNodes, TaskManualNodes } from '../../../nodes';

test.describe('The edge creation tool', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;
    let toolPalette: WorkflowToolPalette;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        await app.waitForReady();
        graph = app.graph;
        toolPalette = app.toolPalette;
    });

    test('should allow creating edges in the graph', async () => {
        const source = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
        const target = await graph.getNodeByLabel(TaskAutomatedNodes.chkwtLabel, TaskAutomated);

        const edges = await graph.waitForCreationOfType(Edge, async () => {
            await toolPalette.waitForVisible();
            const paletteItem = await toolPalette.content.toolElement('Edges', 'Edge');
            await paletteItem.click();

            await source.bounds().then(bounds => bounds.position('middle_center').move());
            await expect(graph).toContainClass(CursorCSS.EDGE_CREATION_SOURCE);
            await source.click();

            await target.bounds().then(bounds => bounds.position('middle_center').move());
            await expect(graph).toContainClass(CursorCSS.EDGE_CREATION_TARGET);
            await target.click();
        });
        expect(edges.length).toBe(1);
        await graph.focus();

        const newEdge = edges[0];

        const sourceId = await newEdge.sourceId();
        expect(sourceId).toBe(await source.idAttr());

        const targetId = await newEdge.targetId();
        expect(targetId).toBe(await target.idAttr());
    });

    test('should allow creating weighted edges in the graph', async () => {
        const chwkt = await graph.getNodeByLabel(TaskAutomatedNodes.chkwtLabel, TaskAutomated);
        const wtok = await graph.getNodeByLabel(TaskAutomatedNodes.wtokLabel, TaskAutomated);

        const outgoingEdge = await chwkt.edges().outgoingEdgeOfType(Edge);
        const decisionNode = await outgoingEdge.targetOfType(ActivityNodeDecision);

        await decisionNode.bounds().then(bounds => bounds.position('middle_center').move());

        const edges = await graph.waitForCreationOfType(WeightedEdge, async () => {
            await toolPalette.waitForVisible();
            const paletteItem = await toolPalette.content.toolElement('Edges', 'Weighted edge');
            await paletteItem.click();

            await decisionNode.bounds().then(bounds => bounds.position('middle_center').move());
            await expect(graph).toContainClass(CursorCSS.EDGE_CREATION_SOURCE);
            await decisionNode.click();

            await wtok.bounds().then(bounds => bounds.position('middle_center').move());
            await expect(graph).toContainClass(CursorCSS.EDGE_CREATION_TARGET);
            await wtok.click();
        });
        expect(edges.length).toBe(1);
        await graph.focus();

        const newEdge = edges[0];

        const sourceId = await newEdge.sourceId();
        expect(sourceId).toBe(await decisionNode.idAttr());

        const targetId = await newEdge.targetId();
        expect(targetId).toBe(await wtok.idAttr());
    });

    test('should prevent invalid combinations', async () => {
        await toolPalette.waitForVisible();
        const paletteItem = await toolPalette.content.toolElement('Edges', 'Weighted edge');
        await paletteItem.click();

        const source = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
        await source.bounds().then(bounds => bounds.position('middle_center').move());
        await expect(graph).toContainClass(CursorCSS.OPERATION_NOT_ALLOWED);
    });

    test('should allow to cancel the operation', async () => {
        const paletteItem = await toolPalette.content.toolElement('Nodes', 'Manual Task');
        await paletteItem.click();

        await expect(graph).toContainClass(CursorCSS.NODE_CREATION);

        await graph.focus();
        await graph.page.keyboard.press('Escape');

        await expect(graph).not.toContainClass(CursorCSS.NODE_CREATION);
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
