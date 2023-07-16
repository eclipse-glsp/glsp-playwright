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
import { Marker } from '@eclipse-glsp/glsp-playwright';
import { GLSPApp } from '@eclipse-glsp/glsp-playwright/glsp';
import { createParameterizedIntegrationData, expect, test } from '@eclipse-glsp/glsp-playwright/test';
import { WorkflowApp } from '../../src/app/workflow-app';
import { WorkflowToolPalette } from '../../src/features/tool-palette/workflow-tool-palette';
import { Edge } from '../../src/graph/elements/edge.po';
import { TaskAutomated } from '../../src/graph/elements/task-automated.po';
import { TaskManual } from '../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../src/graph/workflow.graph';

const integrationData = createParameterizedIntegrationData<{
    nodes: string;
    edges: string;
}>({
    default: {
        edges: 'Edges',
        nodes: 'Nodes'
    },
    override: {
        VSCode: {
            edges: 'EDGES',
            nodes: 'NODES'
        }
    }
});

test.describe('The tool palette', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;
    let toolPalette: WorkflowToolPalette;

    test.beforeEach(async ({ integration }) => {
        app = await GLSPApp.loadApp(WorkflowApp, {
            type: 'integration',
            integration
        });
        graph = app.graph;
        toolPalette = app.toolPalette;
    });

    test('should allow to access the content items', async ({ integration }) => {
        await toolPalette.waitForVisible();

        const groups = await toolPalette.content.toolGroups();
        expect(groups.length).toBe(2);
        expect(await groups[0].header()).toBe(integrationData[integration.type].nodes);
        expect(await groups[1].header()).toBe(integrationData[integration.type].edges);

        const elements0 = await groups[0].items();
        expect(elements0.length).toBe(7);
        expect(await elements0[0].text()).toBe('Automated Task');

        const elements1 = await groups[1].items();
        expect(elements1.length).toBe(2);
        expect(await elements1[1].text()).toBe('Weighted edge');

        const headerGroup = await toolPalette.content.toolGroupByHeaderText('Edges');
        expect(await headerGroup.header()).toBe(integrationData[integration.type].edges);

        const headerElements = await headerGroup.items();
        expect(headerElements.length).toBe(2);
        expect(await headerElements[0].tabIndexAttr()).toBe('7');
        expect(await headerElements[0].text()).toBe('Edge');
        expect(await headerElements[1].tabIndexAttr()).toBe('8');
        expect(await headerElements[1].text()).toBe('Weighted edge');

        const toolElement = await toolPalette.content.toolElement('Nodes', 'Merge Node');
        expect(await toolElement.text()).toBe('Merge Node');
        expect(await toolElement.tabIndexAttr()).toBe('6');
    });

    test('should allow to access the toolbar items', async ({ integration }) => {
        await toolPalette.waitForVisible();

        const deleteTool = await toolPalette.toolbar.deletionTool();
        expect(await deleteTool.classAttr()).not.toContain('clicked');
        await deleteTool.click();
        expect(await deleteTool.classAttr()).toContain('clicked');

        const selectionTool = await toolPalette.toolbar.selectionTool();
        expect(await selectionTool.classAttr()).not.toContain('clicked');
        await selectionTool.click();
        expect(await selectionTool.classAttr()).toContain('clicked');

        const marqueeTool = await toolPalette.toolbar.marqueeTool();
        expect(await marqueeTool.classAttr()).not.toContain('clicked');
        await marqueeTool.click();
        expect(await marqueeTool.classAttr()).toContain('clicked');

        const searchTool = await toolPalette.toolbar.searchTool();
        expect(await searchTool.input.isHidden()).toBeTruthy();

        await searchTool.click();
        expect(await searchTool.input.isVisible()).toBeTruthy();
        await searchTool.search('Auto');

        const groups = await toolPalette.content.toolGroups();
        expect(groups.length).toBe(1);
        expect(await groups[0].header()).toBe(integrationData[integration.type].nodes);

        const elements0 = await groups[0].items();
        expect(elements0.length).toBe(1);
        expect(await elements0[0].text()).toBe('Automated Task');
    });

    test('should allow creating edges in the graph', async () => {
        const source = await graph.getNodeBySelector('[id$="task0"]', TaskManual);
        const target = await graph.getNodeBySelector('[id$="task0_automated"]', TaskAutomated);

        const edges = await graph.waitForCreationOfEdgeType(Edge, async () => {
            await toolPalette.waitForVisible();
            const paletteItem = await toolPalette.content.toolElement('Edges', 'Edge');
            await paletteItem.click();

            await source.click();
            await target.click();
        });
        expect(edges.length).toBe(1);
        await graph.deselect();

        const newEdge = edges[0];

        const sourceId = await newEdge.sourceId();
        expect(sourceId).toBe(await source.idAttr());

        const targetId = await newEdge.targetId();
        expect(targetId).toBe(await target.idAttr());
    });

    test('should allow creating new nodes in the graph', async () => {
        const task = await graph.getNodeBySelector('[id$="task0"]', TaskManual);
        const nodes = await graph.waitForCreationOfNodeType(TaskManual, async () => {
            const paletteItem = await toolPalette.content.toolElement('Nodes', 'Manual Task');
            await paletteItem.click();

            const taskBounds = await task.bounds();
            await taskBounds.position('bottom_left').moveRelative(-50, 0).click();
        });
        expect(nodes.length).toBe(1);
        await graph.deselect();

        const newTask = nodes[0];

        const label = await newTask.children.label();
        expect(await label.textContent()).toBe('ManualTask8');
    });

    test('should allow deleting elements in the graph', async () => {
        await toolPalette.toolbar.deletionTool().click();

        const task = await graph.getNodeBySelector('[id$="task0"]', TaskManual);
        expect(await task.isVisible()).toBeTruthy();

        await task.click();
        await task.waitFor({ state: 'detached' });

        expect(await task.locate().count()).toBe(0);
    });

    test('should allow to validate', async () => {
        await graph.waitForCreationOfType(Marker, async () => {
            await toolPalette.toolbar.validateTool().click();
        });

        const task = await graph.getNodeBySelector('[id$="task0_automated"]', TaskAutomated);
        expect(await task.isVisible()).toBeTruthy();

        const marker = task.marker();
        expect(await marker.isVisible()).toBeTruthy();
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
