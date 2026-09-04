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
import { expect, provideUndoRedoTrigger } from '@eclipse-glsp/playwright';
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

/** Stable identifiers of the test cases provided by {@link defineUndoRedoSuite}. */
export type UndoRedoTestCaseId = 'shouldAllowUndoAndRedo';

/** Integration-specific changes for {@link defineUndoRedoSuite}. */
export type UndoRedoSuiteCustomization = WorkflowSuiteCustomization<Record<UndoRedoTestCaseId, WorkflowTestCase>>;

/**
 * Registers the reusable undo/redo suite.
 *
 * @param test test instance whose integration should execute the suite
 * @param customization integration-specific replacements and extensions
 */
export function defineUndoRedoSuite(test: WorkflowTest, customization: UndoRedoSuiteCustomization = {}): void {
    test.describe('The undo redo trigger', () => {
        test.skip(customization.skip !== undefined, customization.skip);

        const undoRedoTestCases: Record<UndoRedoTestCaseId, WorkflowTestCase> = {
            shouldAllowUndoAndRedo: {
                title: 'should allow undo and redo',
                run: async workflow => {
                    const trigger = provideUndoRedoTrigger(workflow.integration, workflow.app);
                    await expect(workflow.app.graph).toContainElement({ type: TaskManual, query: { label: TaskManualNodes.pushLabel } });

                    const node = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
                    await node.delete();

                    await expect(workflow.app.graph).not.toContainElement({
                        type: TaskManual,
                        query: { label: TaskManualNodes.pushLabel }
                    });

                    await trigger.undo();

                    await expect(workflow.app.graph).toContainElement({ type: TaskManual, query: { label: TaskManualNodes.pushLabel } });

                    await trigger.redo();

                    await expect(workflow.app.graph).not.toContainElement({
                        type: TaskManual,
                        query: { label: TaskManualNodes.pushLabel }
                    });
                }
            }
        };

        const { cases, additional } = customizeWorkflowTestCases(undoRedoTestCases, customization);

        selectWorkflowTest(test, cases.shouldAllowUndoAndRedo)(...workflowTestArguments(cases.shouldAllowUndoAndRedo));
        additional?.(test);
    });
}
