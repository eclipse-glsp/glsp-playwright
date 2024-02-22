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

import { PModelElement, Selectable, expect, skipIntegration, test } from '@eclipse-glsp/glsp-playwright';
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

        const selectedElement = await graph.getNodeBySelector(`.${Selectable.CSS}`, TaskManual);

        expect(await selectedElement.idAttr()).toBe(await element.idAttr());
    });

    test('should deselect after a new selection', async () => {
        const element1 = await graph.getNodeByLabel('Push', TaskManual);
        await element1.select();

        const selectedElement = await graph.getNodeBySelector(`.${Selectable.CSS}`, TaskManual);
        expect(await selectedElement.idAttr()).toBe(await element1.idAttr());

        const element2 = await graph.getNodeByLabel('RflWt', TaskManual);
        await element2.select();

        const selectedElements = await graph.getNodesBySelector(`.${Selectable.CSS}`, TaskManual);
        expect(selectedElements).toHaveLength(1);
        expect(await selectedElements[0].idAttr()).toBe(await element2.idAttr());
    });

    test('should allow to select multiple elements', async () => {
        const element1 = await graph.getNodeByLabel('Push', TaskManual);
        await element1.select();

        const selectedElement = await graph.getNodeBySelector(`.${Selectable.CSS}`, TaskManual);
        expect(await selectedElement.idAttr()).toBe(await element1.idAttr());

        const element2 = await graph.getNodeByLabel('RflWt', TaskManual);
        await element2.select({ modifiers: ['Control'] });

        const targetIds = [await element1.idAttr(), await element2.idAttr()];
        const expectIds = await Promise.all((await graph.getNodesBySelector(`.${Selectable.CSS}`, TaskManual)).map(e => e.idAttr()));
        expect(expectIds).toStrictEqual(targetIds);
    });

    test('should allow to select all elements by using a shortcut', async () => {
        const page = app.page;
        await graph.locate().click();
        await page.keyboard.press('Control+A');
        const elements = await graph.getAllModelElements();

        for (const element of elements) {
            expect(await element.classAttr()).toContain(Selectable.CSS);
        }
    });

    test.describe('', () => {
        test.skip(({ integrationOptions }) => skipIntegration(integrationOptions, 'Theia', 'VSCode'), 'Not supported');

        test('should allow to deselect a single element through a keybinding', async () => {
            const page = app.page;
            const element = await graph.getNodeByLabel('Push', TaskManual);
            await element.select();
            const before = await graph.getNodesBySelector(`.${Selectable.CSS}`, TaskManual);
            expect(before).toHaveLength(1);

            // Resize Handle
            await page.keyboard.press('Escape');
            // Selection
            await page.keyboard.press('Escape');

            await Promise.all((await graph.locate().locator(`.${Selectable.CSS}`).all()).map(l => l.waitFor({ state: 'detached' })));

            const after = await graph.getModelElementsBySelector(`.${Selectable.CSS}`, PModelElement);
            expect(after).toHaveLength(0);
        });
    });

    test('should allow to deselect a single element by clicking outside', async () => {
        const element = await graph.getNodeByLabel('Push', TaskManual);
        await element.select();
        const before = await graph.getNodesBySelector(`.${Selectable.CSS}`, TaskManual);
        expect(before).toHaveLength(1);

        await graph.locate().click();
        await Promise.all((await graph.locate().locator(`.${Selectable.CSS}`).all()).map(l => l.waitFor({ state: 'detached' })));

        const after = await graph.getModelElementsBySelector(`.${Selectable.CSS}`, PModelElement);
        expect(after).toHaveLength(0);
    });
});
