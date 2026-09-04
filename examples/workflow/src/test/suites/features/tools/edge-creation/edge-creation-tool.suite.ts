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
import { CursorCSS } from '../../../../../cursors-css';
import { expect } from '@eclipse-glsp/playwright';
import { ActivityNodeDecision } from '../../../../../graph/elements/activity-node-decision.po';
import { Edge } from '../../../../../graph/elements/edge.po';
import { TaskAutomated } from '../../../../../graph/elements/task-automated.po';
import { TaskManual } from '../../../../../graph/elements/task-manual.po';
import { WeightedEdge } from '../../../../../graph/elements/weighted-edge.po';
import { TaskAutomatedNodes, TaskManualNodes } from '../../../../nodes';
import {
    customizeWorkflowTestCases,
    selectWorkflowTest,
    workflowTestArguments,
    WorkflowSuiteCustomization,
    WorkflowTestCase
} from '../../../../suite';
import { WorkflowTest } from '../../../../workflow-test';

/** Stable identifiers of the test cases provided by {@link defineEdgeCreationToolSuite}. */
export type EdgeCreationToolTestCaseId =
    | 'shouldAllowCreatingEdgesInTheGraph'
    | 'shouldAllowCreatingWeightedEdgesInTheGraph'
    | 'shouldPreventInvalidCombinations'
    | 'shouldAllowToCancelTheOperation';

/** Integration-specific changes for {@link defineEdgeCreationToolSuite}. */
export type EdgeCreationToolSuiteCustomization = WorkflowSuiteCustomization<Record<EdgeCreationToolTestCaseId, WorkflowTestCase>>;

/**
 * Registers the reusable edge-creation-tool suite.
 *
 * @param test test instance whose integration should execute the suite
 * @param customization integration-specific replacements and extensions
 */
export function defineEdgeCreationToolSuite(test: WorkflowTest, customization: EdgeCreationToolSuiteCustomization = {}): void {
    test.describe('The edge creation tool', () => {
        test.skip(customization.skip !== undefined, customization.skip);

        const edgeCreationToolTestCases: Record<EdgeCreationToolTestCaseId, WorkflowTestCase> = {
            shouldAllowCreatingEdgesInTheGraph: {
                title: 'should allow creating edges in the graph',
                run: async workflow => {
                    const source = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
                    const target = await workflow.app.graph.getNodeByLabel(TaskAutomatedNodes.chkwtLabel, TaskAutomated);

                    const edges = await workflow.app.graph.waitForCreationOfType(Edge, async () => {
                        await workflow.app.toolPalette.waitForVisible();
                        const paletteItem = await workflow.app.toolPalette.content.toolElement('Edges', 'Edge');
                        await paletteItem.click();

                        await source.bounds().then(bounds => bounds.position('middle_center').move());
                        await expect(workflow.app.graph).toContainClass(CursorCSS.EDGE_CREATION_SOURCE);
                        await source.click();

                        await target.bounds().then(bounds => bounds.position('middle_center').move());
                        await expect(workflow.app.graph).toContainClass(CursorCSS.EDGE_CREATION_TARGET);
                        await target.click();
                    });
                    expect(edges.length).toBe(1);
                    await workflow.app.graph.focus();

                    const newEdge = edges[0];

                    const sourceId = await newEdge.sourceId();
                    expect(sourceId).toBe(await source.idAttr());

                    const targetId = await newEdge.targetId();
                    expect(targetId).toBe(await target.idAttr());
                }
            },
            shouldAllowCreatingWeightedEdgesInTheGraph: {
                title: 'should allow creating weighted edges in the graph',
                run: async workflow => {
                    const chwkt = await workflow.app.graph.getNodeByLabel(TaskAutomatedNodes.chkwtLabel, TaskAutomated);
                    const wtok = await workflow.app.graph.getNodeByLabel(TaskAutomatedNodes.wtokLabel, TaskAutomated);

                    const outgoingEdge = await chwkt.edges().outgoingEdgeOfType(Edge);
                    const decisionNode = await outgoingEdge.targetOfType(ActivityNodeDecision);

                    await decisionNode.bounds().then(bounds => bounds.position('middle_center').move());

                    const edges = await workflow.app.graph.waitForCreationOfType(WeightedEdge, async () => {
                        await workflow.app.toolPalette.waitForVisible();
                        const paletteItem = await workflow.app.toolPalette.content.toolElement('Edges', 'Weighted edge');
                        await paletteItem.click();

                        await decisionNode.bounds().then(bounds => bounds.position('middle_center').move());
                        await expect(workflow.app.graph).toContainClass(CursorCSS.EDGE_CREATION_SOURCE);
                        await decisionNode.click();

                        await wtok.bounds().then(bounds => bounds.position('middle_center').move());
                        await expect(workflow.app.graph).toContainClass(CursorCSS.EDGE_CREATION_TARGET);
                        await wtok.click();
                    });
                    expect(edges.length).toBe(1);
                    await workflow.app.graph.focus();

                    const newEdge = edges[0];

                    const sourceId = await newEdge.sourceId();
                    expect(sourceId).toBe(await decisionNode.idAttr());

                    const targetId = await newEdge.targetId();
                    expect(targetId).toBe(await wtok.idAttr());
                }
            },
            shouldPreventInvalidCombinations: {
                title: 'should prevent invalid combinations',
                run: async workflow => {
                    await workflow.app.toolPalette.waitForVisible();
                    const paletteItem = await workflow.app.toolPalette.content.toolElement('Edges', 'Weighted edge');
                    await paletteItem.click();

                    const source = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
                    await source.bounds().then(bounds => bounds.position('middle_center').move());
                    await expect(workflow.app.graph).toContainClass(CursorCSS.OPERATION_NOT_ALLOWED);
                }
            },
            shouldAllowToCancelTheOperation: {
                title: 'should allow to cancel the operation',
                run: async workflow => {
                    const paletteItem = await workflow.app.toolPalette.content.toolElement('Nodes', 'Manual Task');
                    await paletteItem.click();

                    await expect(workflow.app.graph).toContainClass(CursorCSS.NODE_CREATION);

                    await workflow.app.graph.focus();
                    await workflow.app.page.keyboard.press('Escape');

                    await expect(workflow.app.graph).not.toContainClass(CursorCSS.NODE_CREATION);
                }
            }
        };

        const { cases, additional } = customizeWorkflowTestCases(edgeCreationToolTestCases, customization);

        selectWorkflowTest(
            test,
            cases.shouldAllowCreatingEdgesInTheGraph
        )(...workflowTestArguments(cases.shouldAllowCreatingEdgesInTheGraph));
        selectWorkflowTest(
            test,
            cases.shouldAllowCreatingWeightedEdgesInTheGraph
        )(...workflowTestArguments(cases.shouldAllowCreatingWeightedEdgesInTheGraph));
        selectWorkflowTest(test, cases.shouldPreventInvalidCombinations)(...workflowTestArguments(cases.shouldPreventInvalidCombinations));
        selectWorkflowTest(test, cases.shouldAllowToCancelTheOperation)(...workflowTestArguments(cases.shouldAllowToCancelTheOperation));
        additional?.(test);
    });
}
