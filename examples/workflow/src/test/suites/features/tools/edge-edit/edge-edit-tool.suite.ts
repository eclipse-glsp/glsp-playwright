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
import { expect, PMetadata, VolatileRoutingPoint } from '@eclipse-glsp/playwright';
import { Edge } from '../../../../../graph/elements/edge.po';
import { TaskAutomated } from '../../../../../graph/elements/task-automated.po';
import { TaskManual } from '../../../../../graph/elements/task-manual.po';
import { TaskAutomatedNodes, TaskManualNodes } from '../../../../nodes';
import {
    customizeWorkflowTestCases,
    selectWorkflowTest,
    workflowTestArguments,
    WorkflowSuiteCustomization,
    WorkflowTestCase
} from '../../../../suite';
import { WorkflowTest } from '../../../../workflow-test';

/** Stable identifiers of the test cases provided by {@link defineEdgeEditToolSuite}. */
export type EdgeEditToolTestCaseId =
    | 'shouldAllowReconnectingEdgesInTheGraph'
    | 'shouldAllowMovingTheRoutingPointsInTheGraph'
    | 'shouldAllowRemovingTheRoutingPointsInTheGraphByRealigning';

/** Integration-specific changes for {@link defineEdgeEditToolSuite}. */
export type EdgeEditToolSuiteCustomization = WorkflowSuiteCustomization<Record<EdgeEditToolTestCaseId, WorkflowTestCase>>;

/**
 * Registers the reusable edge-edit-tool suite.
 *
 * @param test test instance whose integration should execute the suite
 * @param customization integration-specific replacements and extensions
 */
export function defineEdgeEditToolSuite(test: WorkflowTest, customization: EdgeEditToolSuiteCustomization = {}): void {
    test.describe('The edge edit tool', () => {
        test.skip(customization.skip !== undefined, customization.skip);

        const edgeEditToolTestCases: Record<EdgeEditToolTestCaseId, WorkflowTestCase> = {
            shouldAllowReconnectingEdgesInTheGraph: {
                title: 'should allow reconnecting edges in the graph',
                run: async workflow => {
                    const source = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);
                    const newSource = await workflow.app.graph.getNodeByLabel(TaskAutomatedNodes.chktpLabel, TaskAutomated);
                    const newTarget = await workflow.app.graph.getNodeByLabel(TaskAutomatedNodes.chkwtLabel, TaskAutomated);

                    const edge = await source.edges().outgoingEdgeOfType(Edge);
                    await edge.reconnectTarget(newTarget);
                    expect(await edge.targetId()).toBe(await newTarget.idAttr());

                    await edge.reconnectSource(newSource);
                    expect(await edge.sourceId()).toBe(await newSource.idAttr());
                }
            },
            shouldAllowMovingTheRoutingPointsInTheGraph: {
                title: 'should allow moving the routing points in the graph',
                run: async workflow => {
                    const source = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

                    const edge = await source.edges().outgoingEdgeOfType(Edge);
                    const routingPoints = edge.routingPoints();
                    await routingPoints.enable();
                    let points = await routingPoints.points();
                    const currentPointsLength = points.length;

                    let volatilePoints = await routingPoints.volatilePoints();
                    expect(volatilePoints).toHaveLength(1);

                    const volatilePoint = volatilePoints[0];
                    await workflow.app.graph.waitForReplacement(PMetadata.getType(VolatileRoutingPoint), async () => {
                        await volatilePoint.dragToRelativePosition({ x: 50, y: 50 });
                    });

                    points = await routingPoints.points();
                    expect(points).toHaveLength(currentPointsLength + 1);

                    volatilePoints = await routingPoints.volatilePoints();
                    expect(volatilePoints).toHaveLength(2);
                }
            },
            shouldAllowRemovingTheRoutingPointsInTheGraphByRealigning: {
                title: 'should allow removing the routing points in the graph by realigning',
                run: async workflow => {
                    const source = await workflow.app.graph.getNodeByLabel(TaskManualNodes.pushLabel, TaskManual);

                    const edge = await source.edges().outgoingEdgeOfType(Edge);
                    const routingPoints = edge.routingPoints();
                    await routingPoints.enable();
                    let points = await routingPoints.points();
                    const currentPointsLength = points.length;

                    let volatilePoints = await routingPoints.volatilePoints();
                    expect(volatilePoints).toHaveLength(1);

                    // Middle one
                    await workflow.app.graph.waitForReplacement(PMetadata.getType(VolatileRoutingPoint), async () => {
                        await volatilePoints[0].dragToRelativePosition({ x: 0, y: 50 });
                    });

                    points = await routingPoints.points();
                    expect(points).toHaveLength(currentPointsLength + 1);

                    volatilePoints = await routingPoints.volatilePoints();
                    expect(volatilePoints).toHaveLength(2);

                    // Junction
                    const junction = points.find(p => p.lastSnapshot?.kind === 'junction')!;
                    await workflow.app.graph.waitForHide(junction.locator, async () => {
                        await junction.dragToRelativePosition({ x: 20, y: -40 });
                    });

                    points = await routingPoints.points();
                    expect(points).toHaveLength(currentPointsLength);

                    volatilePoints = await routingPoints.volatilePoints();
                    expect(volatilePoints).toHaveLength(1);
                }
            }
        };

        const { cases, additional } = customizeWorkflowTestCases(edgeEditToolTestCases, customization);

        selectWorkflowTest(
            test,
            cases.shouldAllowReconnectingEdgesInTheGraph
        )(...workflowTestArguments(cases.shouldAllowReconnectingEdgesInTheGraph));
        selectWorkflowTest(
            test,
            cases.shouldAllowMovingTheRoutingPointsInTheGraph
        )(...workflowTestArguments(cases.shouldAllowMovingTheRoutingPointsInTheGraph));
        selectWorkflowTest(
            test,
            cases.shouldAllowRemovingTheRoutingPointsInTheGraphByRealigning
        )(...workflowTestArguments(cases.shouldAllowRemovingTheRoutingPointsInTheGraphByRealigning));
        additional?.(test);
    });
}
