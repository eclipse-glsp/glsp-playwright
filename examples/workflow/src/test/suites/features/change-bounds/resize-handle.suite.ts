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
import { PMetadata, ResizeHandle, expect } from '@eclipse-glsp/playwright';
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

/** Stable identifiers of the test cases provided by {@link defineResizeHandleSuite}. */
export type ResizeHandleTestCaseId = 'shouldAllowResizing' | 'shouldShow4Handles';

/** Integration-specific changes for {@link defineResizeHandleSuite}. */
export type ResizeHandleSuiteCustomization = WorkflowSuiteCustomization<Record<ResizeHandleTestCaseId, WorkflowTestCase>>;

/**
 * Registers the reusable resize-handle suite.
 *
 * @param test test instance whose integration should execute the suite
 * @param customization integration-specific replacements and extensions
 */
export function defineResizeHandleSuite(test: WorkflowTest, customization: ResizeHandleSuiteCustomization = {}): void {
    test.describe('The resizing handle', () => {
        test.skip(customization.skip !== undefined, customization.skip);

        const resizeHandleTestCases: Record<ResizeHandleTestCaseId, WorkflowTestCase> = {
            shouldAllowResizing: {
                title: 'should allow resizing',
                run: async workflow => {
                    const task = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

                    const oldBounds = await task.bounds();
                    const oldTopLeft = oldBounds.position('top_left');

                    const resizeHandle = await task.resizeHandles().ofKind('top-left');
                    const newPosition = oldTopLeft.moveRelative(-50, 0);
                    await resizeHandle.dragToAbsolutePosition(newPosition.data);

                    const newBounds = await task.bounds();
                    expect(newBounds.data.width).toBe(oldBounds.data.width + 50);

                    const newTopLeft = newBounds.position('top_left');

                    expect(newTopLeft.data.x).toBe(oldTopLeft.data.x - 50);
                    expect(newTopLeft.data.y).toBe(oldTopLeft.data.y);
                }
            },
            shouldShow4Handles: {
                title: 'should show 4 handles',
                run: async workflow => {
                    const task = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

                    await workflow.app.graph.waitForCreation(PMetadata.getType(ResizeHandle), async () => {
                        await task.click();
                    });

                    const topLeft = await task.resizeHandles().waitForKind('top-left');
                    expect(await topLeft.locate().count()).toBe(1);

                    const topRight = await task.resizeHandles().waitForKind('top-right');
                    expect(await topRight.locate().count()).toBe(1);

                    const bottomLeft = await task.resizeHandles().waitForKind('bottom-left');
                    expect(await bottomLeft.locate().count()).toBe(1);

                    const bottomRight = await task.resizeHandles().waitForKind('bottom-right');
                    expect(await bottomRight.locate().count()).toBe(1);
                }
            }
        };

        const { cases, additional } = customizeWorkflowTestCases(resizeHandleTestCases, customization);

        selectWorkflowTest(test, cases.shouldAllowResizing)(...workflowTestArguments(cases.shouldAllowResizing));
        selectWorkflowTest(test, cases.shouldShow4Handles)(...workflowTestArguments(cases.shouldShow4Handles));
        additional?.(test);
    });
}
