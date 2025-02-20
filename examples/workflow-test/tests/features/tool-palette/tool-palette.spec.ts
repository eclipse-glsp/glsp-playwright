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
import { Marker, expect, test } from '@eclipse-glsp/glsp-playwright';
import { WorkflowApp } from '../../../src/app/workflow-app';
import { WorkflowToolPalette } from '../../../src/features/tool-palette/workflow-tool-palette';
import { WorkflowGraph } from '../../../src/graph/workflow.graph';

test.describe('The tool palette', () => {
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

    test('should allow to access the content items', async () => {
        await toolPalette.waitForVisible();

        const groups = await toolPalette.content.toolGroups();
        expect(groups.length).toBe(2);
        expect(await groups[0].header()).toBe('Nodes');
        expect(await groups[1].header()).toBe('Edges');

        const elements0 = await groups[0].items();
        expect(elements0.length).toBe(7);
        expect(await elements0[0].text()).toBe('Automated Task');

        const elements1 = await groups[1].items();
        expect(elements1.length).toBe(2);
        expect(await elements1[1].text()).toBe('Weighted edge');

        const headerGroup = await toolPalette.content.toolGroupByHeaderText('Edges');
        expect(await headerGroup.header()).toBe('Edges');

        const headerElements = await headerGroup.items();
        expect(headerElements.length).toBe(2);
        expect(await headerElements[0].text()).toBe('Edge');
        expect(await headerElements[1].text()).toBe('Weighted edge');

        const toolElement = await toolPalette.content.toolElement('Nodes', 'Merge Node');
        expect(await toolElement.text()).toBe('Merge Node');
    });

    test('should allow to access the toolbar items', async () => {
        await toolPalette.waitForVisible();

        const deleteTool = await toolPalette.toolbar.deletionTool();
        await expect(deleteTool).not.toContainClass('clicked');
        await deleteTool.click();

        const selectionTool = await toolPalette.toolbar.selectionTool();
        await expect(selectionTool).not.toContainClass('clicked');
        await selectionTool.click();

        const marqueeTool = await toolPalette.toolbar.marqueeTool();
        await expect(marqueeTool).not.toContainClass('clicked');
        await marqueeTool.click();

        const searchTool = await toolPalette.toolbar.searchTool();
        expect(searchTool.input.isHidden()).toBeTruthy();

        await searchTool.click();
        expect(searchTool.input.isVisible()).toBeTruthy();
        await searchTool.search('Auto');

        const groups = await toolPalette.content.toolGroups();
        expect(groups.length).toBe(1);
        expect(await groups[0].header()).toBe('Nodes');

        const elements0 = await groups[0].items();
        expect(elements0.length).toBe(1);
        expect(await elements0[0].text()).toBe('Automated Task');
    });

    test('should allow to validate', async () => {
        const markers = await graph.waitForCreationOfType(Marker, async () => {
            await toolPalette.toolbar.validateTool().click();
        });

        expect(markers.length).toBeGreaterThan(0);
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
