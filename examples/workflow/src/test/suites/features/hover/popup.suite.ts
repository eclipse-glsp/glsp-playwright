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
import { expect, provideDiagramShortcut } from '@eclipse-glsp/playwright';
import { TaskAutomated } from '../../../../graph/elements/task-automated.po';
import { TaskManual } from '../../../../graph/elements/task-manual.po';
import { assertPopup, automatedLabel, expectedAutomatedPopupText, expectedManualPopupText, manualLabel } from '../../../../popup-text';
import {
    customizeWorkflowTestCases,
    selectWorkflowTest,
    workflowTestArguments,
    WorkflowSuiteCustomization,
    WorkflowTestCase
} from '../../../suite';
import { WorkflowTest, WorkflowTestContext } from '../../../workflow-test';

function configureExpectedPopupText(workflow: WorkflowTestContext): void {
    expectedManualPopupText.setServer(workflow.glspServer);
    expectedAutomatedPopupText.setServer(workflow.glspServer);
}

/** Stable identifiers of the test cases provided by {@link definePopupSuite}. */
export type PopupTestCaseId =
    | 'shouldBeShownOnHoveringATaskManual'
    | 'shouldAllowToAccessTheTextDirectlyInElements'
    | 'shouldBeClosedOnEscape'
    | 'shouldBeClosedOnNewHover'
    | 'shouldBeClosedOnMouseMovedAway'
    | 'shouldBeClosedOnFocusLost'
    | 'shouldBeClosedOnCenterCommand'
    | 'shouldBeClosedOnFitToScreenCommand'
    | 'shouldBeClosedOnLayoutCommand';

/** Integration-specific changes for {@link definePopupSuite}. */
export type PopupSuiteCustomization = WorkflowSuiteCustomization<Record<PopupTestCaseId, WorkflowTestCase>>;

/**
 * Registers the reusable popup suite.
 *
 * @param test test instance whose integration should execute the suite
 * @param customization integration-specific replacements and extensions
 */
export function definePopupSuite(test: WorkflowTest, customization: PopupSuiteCustomization = {}): void {
    test.describe('The popup', () => {
        test.skip(customization.skip !== undefined, customization.skip);

        const popupTestCases: Record<PopupTestCaseId, WorkflowTestCase> = {
            shouldBeShownOnHoveringATaskManual: {
                title: 'should be shown on hovering a task manual',
                run: async workflow => {
                    configureExpectedPopupText(workflow);
                    const task = await workflow.app.graph.getNodeByLabel(manualLabel, TaskManual);

                    await expect(workflow.app.popup.locate()).toBeHidden();
                    await task.hover();
                    await workflow.app.popup.waitForVisible();
                    await expect(workflow.app.popup.locate()).toBeVisible();

                    const popup = task.popup();
                    expect(await popup.innerText()).toBe(expectedManualPopupText.get());
                }
            },
            shouldAllowToAccessTheTextDirectlyInElements: {
                title: 'should allow to access the text directly in elements',
                run: async workflow => {
                    configureExpectedPopupText(workflow);
                    const task = await workflow.app.graph.getNodeByLabel(manualLabel, TaskManual);
                    await expect(workflow.app.popup.locate()).toBeHidden();
                    const text = await task.popupText();
                    await expect(workflow.app.popup.locate()).toBeVisible();
                    expect(text).toBe(expectedManualPopupText.get());
                }
            },
            shouldBeClosedOnEscape: {
                title: 'escape',
                run: async workflow => {
                    configureExpectedPopupText(workflow);
                    await workflow.app.graph.focus();
                    await assertPopup(workflow.app, manualLabel, TaskManual, expectedManualPopupText.get());

                    await workflow.app.page.keyboard.press('Escape');
                    await workflow.app.popup.waitForHidden();

                    await expect(workflow.app.popup.locate()).toBeHidden();
                }
            },
            shouldBeClosedOnNewHover: {
                title: 'new hover',
                run: async workflow => {
                    configureExpectedPopupText(workflow);
                    await assertPopup(workflow.app, manualLabel, TaskManual, expectedManualPopupText.get());

                    await workflow.app.popup.close();

                    await assertPopup(workflow.app, automatedLabel, TaskAutomated, expectedAutomatedPopupText.get());
                }
            },
            shouldBeClosedOnMouseMovedAway: {
                title: 'mouse moved away',
                run: async workflow => {
                    configureExpectedPopupText(workflow);
                    await assertPopup(workflow.app, manualLabel, TaskManual, expectedManualPopupText.get());

                    const bounds = await workflow.app.graph.bounds();
                    await bounds.position('middle_center').move();
                    await workflow.app.popup.waitForHidden();

                    await expect(workflow.app.popup.locate()).toBeHidden();
                }
            },
            shouldBeClosedOnFocusLost: {
                title: 'focus lost',
                run: async workflow => {
                    configureExpectedPopupText(workflow);
                    const task = await assertPopup(workflow.app, manualLabel, TaskManual, expectedManualPopupText.get());

                    await workflow.app.graph.locate().click();
                    await workflow.app.popup.waitForHidden();

                    await expect(task.popup().locate()).toBeHidden();
                }
            },
            shouldBeClosedOnCenterCommand: {
                title: 'center command',
                run: async workflow => {
                    configureExpectedPopupText(workflow);
                    await assertPopup(workflow.app, manualLabel, TaskManual, expectedManualPopupText.get());
                    await workflow.app.graph.focus();
                    await workflow.app.page.keyboard.press(provideDiagramShortcut(workflow.integration, 'center'));
                    await workflow.app.popup.waitForHidden();

                    await expect(workflow.app.popup.locate()).toBeHidden();
                }
            },
            shouldBeClosedOnFitToScreenCommand: {
                title: 'fit to screen command',
                run: async workflow => {
                    configureExpectedPopupText(workflow);
                    await assertPopup(workflow.app, manualLabel, TaskManual, expectedManualPopupText.get());
                    await workflow.app.graph.focus();
                    await workflow.app.page.keyboard.press(provideDiagramShortcut(workflow.integration, 'fitToScreen'));
                    await workflow.app.popup.waitForHidden();

                    await expect(workflow.app.popup.locate()).toBeHidden();
                }
            },
            shouldBeClosedOnLayoutCommand: {
                title: 'layout command',
                run: async workflow => {
                    configureExpectedPopupText(workflow);
                    await assertPopup(workflow.app, manualLabel, TaskManual, expectedManualPopupText.get());
                    await workflow.app.graph.focus();
                    await workflow.app.page.keyboard.press(provideDiagramShortcut(workflow.integration, 'layout'));
                    await workflow.app.popup.waitForHidden();

                    await expect(workflow.app.popup.locate()).toBeHidden();
                }
            }
        };

        const { cases, additional } = customizeWorkflowTestCases(popupTestCases, customization);

        selectWorkflowTest(
            test,
            cases.shouldBeShownOnHoveringATaskManual
        )(...workflowTestArguments(cases.shouldBeShownOnHoveringATaskManual));
        selectWorkflowTest(
            test,
            cases.shouldAllowToAccessTheTextDirectlyInElements
        )(...workflowTestArguments(cases.shouldAllowToAccessTheTextDirectlyInElements));
        test.describe('should be closed on', () => {
            selectWorkflowTest(test, cases.shouldBeClosedOnEscape)(...workflowTestArguments(cases.shouldBeClosedOnEscape));
            selectWorkflowTest(test, cases.shouldBeClosedOnNewHover)(...workflowTestArguments(cases.shouldBeClosedOnNewHover));
            selectWorkflowTest(test, cases.shouldBeClosedOnMouseMovedAway)(...workflowTestArguments(cases.shouldBeClosedOnMouseMovedAway));
            selectWorkflowTest(test, cases.shouldBeClosedOnFocusLost)(...workflowTestArguments(cases.shouldBeClosedOnFocusLost));
            selectWorkflowTest(test, cases.shouldBeClosedOnCenterCommand)(...workflowTestArguments(cases.shouldBeClosedOnCenterCommand));
            selectWorkflowTest(
                test,
                cases.shouldBeClosedOnFitToScreenCommand
            )(...workflowTestArguments(cases.shouldBeClosedOnFitToScreenCommand));
            selectWorkflowTest(test, cases.shouldBeClosedOnLayoutCommand)(...workflowTestArguments(cases.shouldBeClosedOnLayoutCommand));
        });
        additional?.(test);
    });
}
