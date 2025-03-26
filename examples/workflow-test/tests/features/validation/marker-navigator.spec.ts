/********************************************************************************
 * Copyright (c) 2023 Business Informatics Group (TU Wien) and others.
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
import { MarkerNavigator, expect, skipIntegration, test } from '@eclipse-glsp/glsp-playwright';
import { provideMarkerNavigatorVariable } from '@eclipse-glsp/glsp-playwright/src/glsp';
import { WorkflowApp } from '../../../src/app/workflow-app';
import { TaskAutomated } from '../../../src/graph/elements/task-automated.po';
import { WorkflowGraph } from '../../../src/graph/workflow.graph';
import { TaskAutomatedNodes } from '../../nodes';

const element1 = TaskAutomatedNodes.chkwtLabel;
const element2 = TaskAutomatedNodes.wtokLabel;
const element3 = TaskAutomatedNodes.brewLabel;
const element4 = TaskAutomatedNodes.keepTpLabel;
const element5 = TaskAutomatedNodes.chktpLabel;
const element6 = TaskAutomatedNodes.preheatLabel;

const forwardOrder = [element1, element2, element3, element4, element5, element6, element1];
const backwardOrder = [element1, element6, element5, element4, element3, element2, element1, element6];

test.describe('The marker navigator', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;
    let navigator: MarkerNavigator;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        await app.waitForReady();
        graph = app.graph;
        navigator = provideMarkerNavigatorVariable(integration, app).get();
        await navigator.trigger();
    });

    // VSCode has no support for navigation
    test.skip(({ integrationOptions }) => skipIntegration(integrationOptions, 'VSCode'), 'Not supported');

    test('should navigate to the first element', async ({ integrationOptions }) => {
        test.skip(skipIntegration(integrationOptions, 'VSCode'), 'Not supported');

        await navigator.navigateForward();
        await expect(graph).toHaveSelected({
            type: TaskAutomated,
            elements: [await graph.getNodeByLabel(element1, TaskAutomated)]
        });
    });

    test('should navigate forwards through the elements', async ({ integrationOptions }) => {
        for (const order of forwardOrder) {
            await navigator.navigateForward();
            await expect(graph).toHaveSelected({
                type: TaskAutomated,
                elements: [await graph.getNodeByLabel(order, TaskAutomated)]
            });
        }
    });

    test('should navigate backwards through the elements', async () => {
        for (const order of backwardOrder) {
            await navigator.navigateBackward();
            await expect(graph).toHaveSelected({
                type: TaskAutomated,
                elements: [await graph.getNodeByLabel(order, TaskAutomated)]
            });
        }
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
