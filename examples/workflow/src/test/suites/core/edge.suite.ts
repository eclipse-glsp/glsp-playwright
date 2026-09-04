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
import { ActivityNodeFork } from '../../../graph/elements/activity-node-fork.po';
import { Edge } from '../../../graph/elements/edge.po';
import { TaskManual } from '../../../graph/elements/task-manual.po';
import { TaskManualNodes } from '../../nodes';
import {
    customizeWorkflowTestCases,
    selectWorkflowTest,
    workflowTestArguments,
    WorkflowSuiteCustomization,
    WorkflowTestCase
} from '../../suite';
import { WorkflowTest } from '../../workflow-test';

/** Stable identifiers of the test cases provided by {@link defineEdgeSuite}. */
export type EdgeTestCaseId = 'shouldHaveSourceAndTargetNodes';

/** Integration-specific changes for {@link defineEdgeSuite}. */
export type EdgeSuiteCustomization = WorkflowSuiteCustomization<Record<EdgeTestCaseId, WorkflowTestCase>>;

/**
 * Registers the reusable Edges suite.
 *
 * @param test test instance whose integration should execute the suite
 * @param customization integration-specific replacements and extensions
 */
export function defineEdgeSuite(test: WorkflowTest, customization: EdgeSuiteCustomization = {}): void {
    test.describe('Edges', () => {
        test.skip(customization.skip !== undefined, customization.skip);

        const edgeTestCases: Record<EdgeTestCaseId, WorkflowTestCase> = {
            shouldHaveSourceAndTargetNodes: {
                title: 'should have source and target nodes',
                run: async workflow => {
                    const source = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
                    const target = await workflow.app.graph.getNode('[id$="fork_1"]', ActivityNodeFork);
                    const edge = await workflow.app.graph.getEdgeBetween(Edge, { sourceNode: source, targetNode: target });

                    const sourceId = await edge.sourceId();
                    expect(sourceId).toBe(await source.idAttr());

                    const targetId = await edge.targetId();
                    expect(targetId).toBe(await target.idAttr());
                }
            }
        };

        const { cases, additional } = customizeWorkflowTestCases(edgeTestCases, customization);

        selectWorkflowTest(test, cases.shouldHaveSourceAndTargetNodes)(...workflowTestArguments(cases.shouldHaveSourceAndTargetNodes));
        additional?.(test);
    });
}
