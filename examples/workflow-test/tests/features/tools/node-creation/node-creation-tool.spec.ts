/********************************************************************************
 * Copyright (c) 2024 EclipseSource and others.
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
import { ServerVariable } from '@eclipse-glsp/glsp-playwright/src/test';
import { WorkflowApp } from '../../../../src/app/workflow-app';
import { WorkflowToolPalette } from '../../../../src/features/tool-palette/workflow-tool-palette';
import { Category } from '../../../../src/graph/elements/category.po';
import { TaskManual } from '../../../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../../../src/graph/workflow.graph';
import { CategoryNodes, TaskManualNodes } from '../../../nodes';

test.describe('The node creation tool', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;
    let toolPalette: WorkflowToolPalette;

    let taskManualCreatedLabel: ServerVariable<string>;
    let categoryCreatedLabel: ServerVariable<string>;

    test.beforeEach(async ({ integration, glspServer }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        graph = app.graph;
        toolPalette = app.toolPalette;
        taskManualCreatedLabel = TaskManualNodes.createdLabel(glspServer);
        categoryCreatedLabel = CategoryNodes.createdLabel(glspServer);
    });

    test('should allow creating new nodes in the graph', async () => {
        const task = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
        const nodes = await graph.waitForCreationOfType(TaskManual, async () => {
            const paletteItem = await toolPalette.content.toolElement('Nodes', 'Manual Task');
            await paletteItem.click();

            await expect(graph).toContainClass(CursorCSS.NODE_CREATION);

            const taskBounds = await task.bounds();
            await taskBounds.position('bottom_left').moveRelative(-50, 0).click();
        });
        expect(nodes).toHaveLength(1);
        await graph.focus();

        const newTask = nodes[0];

        const label = await newTask.children.label();
        expect(await label.textContent()).toBe(taskManualCreatedLabel.get());
    });

    test('should allow creating new child nodes', async () => {
        // Create a new category
        let nodes = await graph.waitForCreationOfType(Category, async () => {
            const paletteItem = await toolPalette.content.toolElement('Nodes', 'Category');
            await paletteItem.click();

            await expect(graph).toContainClass(CursorCSS.NODE_CREATION);
            const node = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
            const bounds = await node.bounds();
            await bounds.position('bottom_left').moveRelative(0, 60).click();
        });
        expect(nodes).toHaveLength(1);
        await graph.focus();

        const newCategory = nodes[0];

        let label = await newCategory.children.label();
        expect(await label.textContent()).toBe(categoryCreatedLabel.get());

        // Create a new task inside the category
        nodes = await graph.waitForCreationOfType(TaskManual, async () => {
            const paletteItem = await toolPalette.content.toolElement('Nodes', 'Manual Task');
            await paletteItem.click();

            await expect(graph).toContainClass(CursorCSS.NODE_CREATION);

            const bounds = await newCategory.bounds();
            await bounds.position('middle_right').click();
        });
        expect(nodes).toHaveLength(1);
        await graph.focus();

        const newTask = nodes[0];

        label = await newTask.children.label();
        expect(await label.textContent()).toBe(taskManualCreatedLabel.get());
        // Check if it is inside the category
        const children = await newCategory.children.allOfType(TaskManual);
        expect(children).toHaveLength(1);
        expect(await children[0].idAttr()).toBe(await newTask.idAttr());
    });

    test('should prevent invalid combinations', async () => {
        const paletteItem = await toolPalette.content.toolElement('Nodes', 'Manual Task');
        await paletteItem.click();

        await expect(graph).toContainClass(CursorCSS.NODE_CREATION);

        const task = await graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
        const bounds = await task.bounds();
        await bounds.position('middle_right').move();

        await expect(graph).not.toContainClass(CursorCSS.NODE_CREATION);
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
