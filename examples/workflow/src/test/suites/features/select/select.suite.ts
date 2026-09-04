/********************************************************************************
 * Copyright (c) 2024-2026 EclipseSource and others.
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

import { PModelElement, expect } from '@eclipse-glsp/playwright';
import { TaskManual } from '../../../../graph/elements/task-manual.po';
import {
    customizeWorkflowTestCases,
    selectWorkflowTest,
    workflowTestArguments,
    WorkflowSuiteCustomization,
    WorkflowTestCase
} from '../../../suite';
import { WorkflowTest } from '../../../workflow-test';

/** Stable identifiers of the test cases provided by {@link defineSelectSuite}. */
export type SelectTestCaseId =
    | 'shouldAllowToSelectASingleElement'
    | 'shouldDeselectAfterANewSelection'
    | 'shouldAllowToSelectMultipleElements'
    | 'shouldAllowToSelectAllElementsByUsingAShortcut'
    | 'shouldAllowToDeselectASingleElementByClickingOutside';

/** Integration-specific changes for {@link defineSelectSuite}. */
export type SelectSuiteCustomization = WorkflowSuiteCustomization<Record<SelectTestCaseId, WorkflowTestCase>>;

/**
 * Registers the reusable selection suite.
 *
 * @param test test instance whose integration should execute the suite
 * @param customization integration-specific replacements and extensions
 */
export function defineSelectSuite(test: WorkflowTest, customization: SelectSuiteCustomization = {}): void {
    test.describe('The select feature', () => {
        test.skip(customization.skip !== undefined, customization.skip);

        const selectTestCases: Record<SelectTestCaseId, WorkflowTestCase> = {
            shouldAllowToSelectASingleElement: {
                title: 'should allow to select a single element',
                run: async workflow => {
                    const element = await workflow.app.graph.getNodeByLabel('Push', TaskManual);
                    await element.select();
                    await expect(workflow.app.graph).toHaveSelected({
                        type: TaskManual,
                        elements: [element]
                    });
                }
            },
            shouldDeselectAfterANewSelection: {
                title: 'should deselect after a new selection',
                run: async workflow => {
                    const element1 = await workflow.app.graph.getNodeByLabel('Push', TaskManual);
                    await element1.select();
                    await expect(workflow.app.graph).toHaveSelected({
                        type: TaskManual,
                        elements: [element1]
                    });

                    const element2 = await workflow.app.graph.getNodeByLabel('RflWt', TaskManual);
                    await element2.select();
                    await expect(workflow.app.graph).toHaveSelected({
                        type: TaskManual,
                        elements: [element2]
                    });
                }
            },
            shouldAllowToSelectMultipleElements: {
                title: 'should allow to select multiple elements',
                run: async workflow => {
                    const element1 = await workflow.app.graph.getNodeByLabel('Push', TaskManual);
                    await element1.select();
                    await expect(workflow.app.graph).toHaveSelected({
                        type: TaskManual,
                        elements: [element1]
                    });

                    const element2 = await workflow.app.graph.getNodeByLabel('RflWt', TaskManual);
                    await element2.select({ modifiers: ['Control'] });
                    await expect(workflow.app.graph).toHaveSelected({
                        type: TaskManual,
                        elements: [element1, element2]
                    });
                }
            },
            shouldAllowToSelectAllElementsByUsingAShortcut: {
                title: 'should allow to select all elements by using a shortcut',
                run: async workflow => {
                    await workflow.app.graph.locate().click();
                    await workflow.app.page.keyboard.press('Control+A');
                    await expect(workflow.app.graph).toHaveSelected({
                        type: PModelElement,
                        elements: () => workflow.app.graph.getAllModelElements()
                    });
                }
            },
            shouldAllowToDeselectASingleElementByClickingOutside: {
                title: 'should allow to deselect a single element by clicking outside',
                run: async workflow => {
                    const element = await workflow.app.graph.getNodeByLabel('Push', TaskManual);
                    await element.select();
                    await expect(workflow.app.graph).toHaveSelected({
                        type: TaskManual,
                        elements: [element]
                    });

                    await workflow.app.graph.locate().click();
                    await expect(workflow.app.graph).toBeUnselected();
                }
            }
        };

        const { cases, additional } = customizeWorkflowTestCases(selectTestCases, customization);

        selectWorkflowTest(
            test,
            cases.shouldAllowToSelectASingleElement
        )(...workflowTestArguments(cases.shouldAllowToSelectASingleElement));
        selectWorkflowTest(test, cases.shouldDeselectAfterANewSelection)(...workflowTestArguments(cases.shouldDeselectAfterANewSelection));
        selectWorkflowTest(
            test,
            cases.shouldAllowToSelectMultipleElements
        )(...workflowTestArguments(cases.shouldAllowToSelectMultipleElements));
        selectWorkflowTest(
            test,
            cases.shouldAllowToSelectAllElementsByUsingAShortcut
        )(...workflowTestArguments(cases.shouldAllowToSelectAllElementsByUsingAShortcut));
        selectWorkflowTest(
            test,
            cases.shouldAllowToDeselectASingleElementByClickingOutside
        )(...workflowTestArguments(cases.shouldAllowToDeselectASingleElementByClickingOutside));
        additional?.(test);
    });
}
