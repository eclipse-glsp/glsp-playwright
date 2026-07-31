/********************************************************************************
 * Copyright (c) 2023-2026 Business Informatics Group (TU Wien) and others.
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
import { expect, runInIntegration, test } from '@eclipse-glsp/playwright';
import { WorkflowApp } from '../../../src/app/workflow-app';
import { TaskAutomated } from '../../../src/graph/elements/task-automated.po';
import { TaskManual } from '../../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../../src/graph/workflow.graph';
import { assertPopup, automatedLabel, expectedAutomatedPopupText, expectedManualPopupText, manualLabel } from '../../../src/popup-text';

test.describe('The popup', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration, glspServer }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        await app.waitForReady();
        graph = app.graph;
        expectedManualPopupText.setServer(glspServer);
        expectedAutomatedPopupText.setServer(glspServer);
    });

    test('should be shown on hovering a task manual', async () => {
        const task = await graph.getNodeByLabel(manualLabel, TaskManual);

        await expect(app.popup.locate()).toBeHidden();
        await task.hover();
        await app.popup.waitForVisible();
        await expect(app.popup.locate()).toBeVisible();

        const popup = task.popup();
        expect(await popup.innerText()).toBe(expectedManualPopupText.get());
    });

    test('should allow to access the text directly in elements', async () => {
        const task = await app.graph.getNodeByLabel(manualLabel, TaskManual);
        await expect(app.popup.locate()).toBeHidden();
        const text = await task.popupText();
        await expect(app.popup.locate()).toBeVisible();
        expect(text).toBe(expectedManualPopupText.get());
    });

    test.describe('should be closed on', () => {
        test('escape', async () => {
            await app.graph.focus();
            await assertPopup(app, manualLabel, TaskManual, expectedManualPopupText.get());

            await app.page.keyboard.press('Escape');
            await app.popup.waitForHidden();

            await expect(app.popup.locate()).toBeHidden();
        });

        test('new hover', async () => {
            await assertPopup(app, manualLabel, TaskManual, expectedManualPopupText.get());

            await app.popup.close();

            await assertPopup(app, automatedLabel, TaskAutomated, expectedAutomatedPopupText.get());
        });

        test('mouse moved away', async () => {
            await assertPopup(app, manualLabel, TaskManual, expectedManualPopupText.get());

            const bounds = await app.graph.bounds();
            await bounds.position('middle_center').move();
            await app.popup.waitForHidden();

            await expect(app.popup.locate()).toBeHidden();
        });

        test('focus lost', async () => {
            const task = await assertPopup(app, manualLabel, TaskManual, expectedManualPopupText.get());

            await app.graph.locate().click();
            await app.popup.waitForHidden();

            await expect(task.popup().locate()).toBeHidden();
        });

        test('center command', async ({ integration }) => {
            await assertPopup(app, manualLabel, TaskManual, expectedManualPopupText.get());
            await graph.focus();
            await runInIntegration(
                integration,
                ['Standalone'],
                async () => {
                    await app.page.keyboard.press('Control+Shift+C');
                },
                async () => {
                    await app.page.keyboard.press('Alt+C');
                }
            );
            await app.popup.waitForHidden();

            await expect(app.popup.locate()).toBeHidden();
        });

        test('fit to screen command', async ({ integration }) => {
            await assertPopup(app, manualLabel, TaskManual, expectedManualPopupText.get());
            await graph.focus();
            await runInIntegration(
                integration,
                ['Standalone'],
                async () => {
                    await app.page.keyboard.press('Control+Shift+F');
                },
                async () => {
                    await app.page.keyboard.press('Alt+F');
                }
            );
            await app.popup.waitForHidden();

            await expect(app.popup.locate()).toBeHidden();
        });

        test('layout command', async ({ integration }) => {
            await assertPopup(app, manualLabel, TaskManual, expectedManualPopupText.get());
            await graph.focus();
            await runInIntegration(
                integration,
                ['Standalone'],
                async () => {
                    await app.page.keyboard.press('Control+Shift+L');
                },
                async () => {
                    await app.page.keyboard.press('Alt+L');
                }
            );
            await app.popup.waitForHidden();

            await expect(app.popup.locate()).toBeHidden();
        });
    });
});
