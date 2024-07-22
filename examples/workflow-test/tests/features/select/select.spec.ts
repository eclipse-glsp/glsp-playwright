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

import { PModelElement, expect, skipIntegration, test } from '@eclipse-glsp/glsp-playwright';
import { WorkflowApp } from '../../../src/app/workflow-app';
import { TaskManual } from '../../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../../src/graph/workflow.graph';

test.describe('The select feature', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        graph = app.graph;
    });

    test('should allow to select a single element', async () => {
        const element = await graph.getNodeByLabel('Push', TaskManual);
        await element.select();
        await expect(graph).toHaveSelected({
            type: TaskManual,
            elements: [element]
        });
    });

    test('should deselect after a new selection', async () => {
        const element1 = await graph.getNodeByLabel('Push', TaskManual);
        await element1.select();
        await expect(graph).toHaveSelected({
            type: TaskManual,
            elements: [element1]
        });

        const element2 = await graph.getNodeByLabel('RflWt', TaskManual);
        await element2.select();
        await expect(graph).toHaveSelected({
            type: TaskManual,
            elements: [element2]
        });
    });

    test('should allow to select multiple elements', async () => {
        const element1 = await graph.getNodeByLabel('Push', TaskManual);
        await element1.select();
        await expect(graph).toHaveSelected({
            type: TaskManual,
            elements: [element1]
        });

        const element2 = await graph.getNodeByLabel('RflWt', TaskManual);
        await element2.select({ modifiers: ['Control'] });
        await expect(graph).toHaveSelected({
            type: TaskManual,
            elements: [element1, element2]
        });
    });

    test('should allow to select all elements by using a shortcut', async () => {
        await graph.locate().click();
        await app.page.keyboard.press('Control+A');
        await expect(graph).toHaveSelected({
            type: PModelElement,
            elements: await graph.getAllModelElements()
        });
    });

    test.describe('', () => {
        test.skip(({ integrationOptions }) => skipIntegration(integrationOptions, 'Theia', 'VSCode'), 'Not supported');

        test('should allow to deselect a single element through a keybinding', async () => {
            const page = app.page;
            const element = await graph.getNodeByLabel('Push', TaskManual);
            await element.select();
            await expect(graph).toHaveSelected({
                type: TaskManual,
                elements: [element]
            });

            // Selection
            await page.keyboard.press('Escape');

            await expect(graph).toBeUnselected();
        });
    });

    test('should allow to deselect a single element by clicking outside', async () => {
        const element = await graph.getNodeByLabel('Push', TaskManual);
        await element.select();
        await expect(graph).toHaveSelected({
            type: TaskManual,
            elements: [element]
        });

        await graph.locate().click();
        await expect(graph).toBeUnselected();
    });
});
