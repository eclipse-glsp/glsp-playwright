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
import { MarkerNavigator, StandaloneMarkerNavigator, TheiaMarkerNavigator, expect, test } from '@eclipse-glsp/glsp-playwright/';
import { skipIntegration } from '@eclipse-glsp/glsp-playwright/src/test';
import { IntegrationVariable } from '@eclipse-glsp/glsp-playwright/src/test/dynamic-variable';
import { WorkflowApp } from '../../../src/app/workflow-app';
import { TaskAutomated } from '../../../src/graph/elements/task-automated.po';
import { WorkflowGraph } from '../../../src/graph/workflow.graph';

const element1 = 'ChkWt';
const element2 = 'WtOK';
const element3 = 'Brew';
const element4 = 'KeepTp';
const element5 = 'ChkTp';
const element6 = 'PreHeat';

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
        graph = app.graph;
        const navigatorProvider = new IntegrationVariable<MarkerNavigator>({
            value: {
                Standalone: new StandaloneMarkerNavigator(app),
                Theia: new TheiaMarkerNavigator(app)
            },
            integration
        });

        navigator = navigatorProvider.get();

        await navigator.trigger();
    });

    // VSCode has no support for navigation
    test.skip(({ integrationOptions }) => skipIntegration(integrationOptions, 'VSCode'), 'Not supported');

    test('should navigate to the first element', async ({ integrationOptions }) => {
        test.skip(skipIntegration(integrationOptions, 'VSCode'), 'Not supported');

        await navigator.navigateForward();
        await app.page.pause();
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
