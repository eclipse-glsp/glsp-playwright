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
import { TaskManual } from '../../../../graph/elements/task-manual.po';
import { TaskManualNodes } from '../../../nodes';
import {
    customizeWorkflowTestCases,
    selectWorkflowTest,
    workflowTestArguments,
    WorkflowSuiteCustomization,
    WorkflowTestCase
} from '../../../suite';
import { WorkflowTest } from '../../../workflow-test';

/** Stable identifiers of the test cases provided by {@link defineLabelEditToolSuite}. */
export type LabelEditToolTestCaseId =
    | 'shouldAllowNodesToBeRenamed'
    | 'shouldAllowNodesToBeRenamedByUsingTheKeyboard'
    | 'shouldNotAllowEmptyText';

/** Integration-specific changes for {@link defineLabelEditToolSuite}. */
export type LabelEditToolSuiteCustomization = WorkflowSuiteCustomization<Record<LabelEditToolTestCaseId, WorkflowTestCase>>;

/**
 * Registers the reusable label-edit-tool suite.
 *
 * @param test test instance whose integration should execute the suite
 * @param customization integration-specific replacements and extensions
 */
export function defineLabelEditToolSuite(test: WorkflowTest, customization: LabelEditToolSuiteCustomization = {}): void {
    test.describe('The label edit tool', () => {
        test.skip(customization.skip !== undefined, customization.skip);

        const labelEditToolTestCases: Record<LabelEditToolTestCaseId, WorkflowTestCase> = {
            shouldAllowNodesToBeRenamed: {
                title: 'should allow nodes to be renamed',
                run: async workflow => {
                    const node = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

                    await node.rename('New Label');
                    expect(await node.label).toBe('New Label');
                }
            },
            shouldAllowNodesToBeRenamedByUsingTheKeyboard: {
                title: 'should allow nodes to be renamed by using the keyboard',
                run: async workflow => {
                    const node = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

                    await node.click();
                    await node.page.keyboard.press('F2');
                    await node.page.keyboard.type('New Label');
                    await node.page.keyboard.press('Enter');
                    await workflow.app.labelEditor.waitForHidden();

                    expect(await node.label).toBe('New Label');
                }
            },
            shouldNotAllowEmptyText: {
                title: 'should not allow empty text',
                run: async workflow => {
                    const node = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

                    await node.click();
                    await node.page.keyboard.press('F2');
                    await node.page.keyboard.type(' ');
                    await node.page.keyboard.press('Backspace');
                    await node.page.keyboard.press('Enter');

                    expect(await workflow.app.labelEditor.getWarning()).toBe('Name must not be empty');
                }
            }
        };

        const { cases, additional } = customizeWorkflowTestCases(labelEditToolTestCases, customization);

        selectWorkflowTest(test, cases.shouldAllowNodesToBeRenamed)(...workflowTestArguments(cases.shouldAllowNodesToBeRenamed));
        selectWorkflowTest(
            test,
            cases.shouldAllowNodesToBeRenamedByUsingTheKeyboard
        )(...workflowTestArguments(cases.shouldAllowNodesToBeRenamedByUsingTheKeyboard));
        selectWorkflowTest(test, cases.shouldNotAllowEmptyText)(...workflowTestArguments(cases.shouldNotAllowEmptyText));
        additional?.(test);
    });
}
