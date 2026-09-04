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
import { PMetadata, RoutingPoint, expect } from '@eclipse-glsp/playwright';
import { Edge } from '../../../../graph/elements/edge.po';
import { TaskManual } from '../../../../graph/elements/task-manual.po';
import {
    customizeWorkflowTestCases,
    selectWorkflowTest,
    workflowTestArguments,
    WorkflowSuiteCustomization,
    WorkflowTestCase
} from '../../../suite';
import { WorkflowTest } from '../../../workflow-test';

/** Stable identifiers of the test cases provided by {@link defineRoutingPointSuite}. */
export type RoutingPointTestCaseId = 'shouldBeAccessible' | 'shouldHaveTheDataKindAttribute';

/** Integration-specific changes for {@link defineRoutingPointSuite}. */
export type RoutingPointSuiteCustomization = WorkflowSuiteCustomization<Record<RoutingPointTestCaseId, WorkflowTestCase>>;

/**
 * Registers the reusable edge-routing-point suite.
 *
 * @param test test instance whose integration should execute the suite
 * @param customization integration-specific replacements and extensions
 */
export function defineRoutingPointSuite(test: WorkflowTest, customization: RoutingPointSuiteCustomization = {}): void {
    test.describe('The routing points of an edge', () => {
        test.skip(customization.skip !== undefined, customization.skip);

        const routingPointTestCases: Record<RoutingPointTestCaseId, WorkflowTestCase> = {
            shouldBeAccessible: {
                title: 'should be accessible',
                run: async workflow => {
                    const node = await workflow.app.graph.getNodeByLabel('Push', TaskManual);
                    const edge = await node.edges().outgoingEdgeOfType(Edge);

                    const routingPoints = edge.routingPoints();
                    expect((await routingPoints.points({ wait: false })).length).toBe(0);
                    expect((await routingPoints.volatilePoints({ wait: false })).length).toBe(0);

                    await workflow.app.graph.waitForCreation(PMetadata.getType(RoutingPoint), async () => {
                        await edge.click();
                    });

                    expect((await routingPoints.points()).length).toBeGreaterThan(0);
                    expect((await routingPoints.volatilePoints()).length).toBe(1);
                }
            },
            shouldHaveTheDataKindAttribute: {
                title: 'should have the data kind attribute',
                run: async workflow => {
                    const node = await workflow.app.graph.getNodeByLabel('Push', TaskManual);
                    const edge = await node.edges().outgoingEdgeOfType(Edge);

                    const routingPoints = edge.routingPoints();
                    expect((await routingPoints.volatilePoints({ wait: false })).length).toBe(0);

                    await workflow.app.graph.waitForCreation(PMetadata.getType(RoutingPoint), async () => {
                        await edge.click();
                    });

                    const points = await routingPoints.volatilePoints();
                    expect(points.length).toBe(1);

                    const point = points[0];
                    expect(await point.dataKindAttr()).toBe('line');
                }
            }
        };

        const { cases, additional } = customizeWorkflowTestCases(routingPointTestCases, customization);

        selectWorkflowTest(test, cases.shouldBeAccessible)(...workflowTestArguments(cases.shouldBeAccessible));
        selectWorkflowTest(test, cases.shouldHaveTheDataKindAttribute)(...workflowTestArguments(cases.shouldHaveTheDataKindAttribute));
        additional?.(test);
    });
}
