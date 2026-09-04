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
import { TaskManual } from '../../../../../graph/elements/task-manual.po';
import { TaskManualNodes } from '../../../../nodes';
import {
    customizeWorkflowTestCases,
    selectWorkflowTest,
    workflowTestArguments,
    WorkflowSuiteCustomization,
    WorkflowTestCase
} from '../../../../suite';
import { WorkflowTest } from '../../../../workflow-test';

/** Stable identifiers of the test cases provided by {@link defineDeletionToolSuite}. */
export type DeletionToolTestCaseId =
    | 'shouldAllowDeletingElementsInTheGraphByMouse'
    | 'shouldAllowDeletingElementsInTheGraphByKeyboard'
    | 'shouldAllowDeletingElementsInTheGraph';

/** Integration-specific changes for {@link defineDeletionToolSuite}. */
export type DeletionToolSuiteCustomization = WorkflowSuiteCustomization<Record<DeletionToolTestCaseId, WorkflowTestCase>>;

/**
 * Registers the reusable deletion-tool suite.
 *
 * @param test test instance whose integration should execute the suite
 * @param customization integration-specific replacements and extensions
 */
export function defineDeletionToolSuite(test: WorkflowTest, customization: DeletionToolSuiteCustomization = {}): void {
    test.describe('The deletion tool', () => {
        test.skip(customization.skip !== undefined, customization.skip);

        const deletionToolTestCases: Record<DeletionToolTestCaseId, WorkflowTestCase> = {
            shouldAllowDeletingElementsInTheGraphByMouse: {
                title: 'should allow deleting elements in the graph by mouse',
                run: async workflow => {
                    await workflow.app.toolPalette.toolbar.deletionTool().click();

                    const task = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
                    expect(await task.isVisible()).toBeTruthy();

                    await task.click();
                    await task.waitFor({ state: 'detached' });

                    expect(await task.locate().count()).toBe(0);
                }
            },
            shouldAllowDeletingElementsInTheGraphByKeyboard: {
                title: 'should allow deleting elements in the graph by keyboard',
                run: async workflow => {
                    const task = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

                    expect(await task.locate().count()).toBe(1);
                    await task.delete();
                    expect(await task.locate().count()).toBe(0);
                }
            },
            shouldAllowDeletingElementsInTheGraph: {
                title: 'should allow deleting elements in the graph',
                run: async workflow => {
                    const task = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

                    expect(await task.locate().count()).toBe(1);
                    await task.delete();
                    expect(await task.locate().count()).toBe(0);
                }
            }
        };

        const { cases, additional } = customizeWorkflowTestCases(deletionToolTestCases, customization);

        selectWorkflowTest(
            test,
            cases.shouldAllowDeletingElementsInTheGraphByMouse
        )(...workflowTestArguments(cases.shouldAllowDeletingElementsInTheGraphByMouse));
        selectWorkflowTest(
            test,
            cases.shouldAllowDeletingElementsInTheGraphByKeyboard
        )(...workflowTestArguments(cases.shouldAllowDeletingElementsInTheGraphByKeyboard));
        selectWorkflowTest(
            test,
            cases.shouldAllowDeletingElementsInTheGraph
        )(...workflowTestArguments(cases.shouldAllowDeletingElementsInTheGraph));
        additional?.(test);
    });
}
