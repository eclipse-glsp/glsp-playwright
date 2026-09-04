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
import { expect } from '@eclipse-glsp/playwright';
import { TaskAutomated } from '../../../../graph/elements/task-automated.po';
import {
    customizeWorkflowTestCases,
    selectWorkflowTest,
    workflowTestArguments,
    WorkflowSuiteCustomization,
    WorkflowTestCase
} from '../../../suite';
import { WorkflowTest } from '../../../workflow-test';

const label = 'ChkWt';
const expectedAutomatedPopupText = 'INFO: This is an automated task';

/** Stable identifiers of the test cases provided by {@link defineMarkerSuite}. */
export type MarkerTestCaseId = 'shouldBeShownAfterValidation' | 'shouldShowAPopupOnHover' | 'shouldBeStillVisibleAfterResizing';

/** Integration-specific changes for {@link defineMarkerSuite}. */
export type MarkerSuiteCustomization = WorkflowSuiteCustomization<Record<MarkerTestCaseId, WorkflowTestCase>>;

/**
 * Registers the reusable marker suite.
 *
 * @param test test instance whose integration should execute the suite
 * @param customization integration-specific replacements and extensions
 */
export function defineMarkerSuite(test: WorkflowTest, customization: MarkerSuiteCustomization = {}): void {
    test.describe('The marker', () => {
        test.skip(customization.skip !== undefined, customization.skip);

        const markerTestCases: Record<MarkerTestCaseId, WorkflowTestCase> = {
            shouldBeShownAfterValidation: {
                title: 'should be shown after validation',
                run: async workflow => {
                    await workflow.app.toolPalette.toolbar.validateTool().trigger();
                    const task = await workflow.app.graph.getNodeByLabel(label, TaskAutomated);

                    const marker = task.marker();
                    await expect(marker.locate()).toBeVisible();
                }
            },
            shouldShowAPopupOnHover: {
                title: 'should show a popup on hover',
                run: async workflow => {
                    await workflow.app.toolPalette.toolbar.validateTool().trigger();
                    const task = await workflow.app.graph.getNodeByLabel(label, TaskAutomated);
                    expect(await task.marker().popupText()).toBe(expectedAutomatedPopupText);
                }
            },
            shouldBeStillVisibleAfterResizing: {
                title: 'should be still visible after resizing',
                run: async workflow => {
                    await workflow.app.toolPalette.toolbar.validateTool().trigger();
                    const task = await workflow.app.graph.getNodeByLabel(label, TaskAutomated);
                    expect(await task.marker().popupText()).toBe(expectedAutomatedPopupText);

                    await workflow.app.popup.close();
                    await expect(task.popup().locate()).toBeHidden();

                    const handle = await task.resizeHandles().ofKind('top-left');
                    await handle.dragToRelativePosition({ x: 10, y: 10 });
                    expect(await task.marker().popupText()).toBe(expectedAutomatedPopupText);
                }
            }
        };

        const { cases, additional } = customizeWorkflowTestCases(markerTestCases, customization);

        selectWorkflowTest(test, cases.shouldBeShownAfterValidation)(...workflowTestArguments(cases.shouldBeShownAfterValidation));
        selectWorkflowTest(test, cases.shouldShowAPopupOnHover)(...workflowTestArguments(cases.shouldShowAPopupOnHover));
        selectWorkflowTest(
            test,
            cases.shouldBeStillVisibleAfterResizing
        )(...workflowTestArguments(cases.shouldBeStillVisibleAfterResizing));
        additional?.(test);
    });
}
