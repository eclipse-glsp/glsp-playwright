/********************************************************************************
 * Copyright (c) 2024 EclipseSource and others.
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
/* eslint-disable max-len */

import { expect, extractDebugInformationOfGLSPLocator, extractMetaTree, test } from '@eclipse-glsp/glsp-playwright/';
import { WorkflowApp } from '../../src/app/workflow-app';
import { TaskManual } from '../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../src/graph/workflow.graph';

const taskSelector = '[id$="task_Push"]';
const expectedElementMetadata = {
    id: 'sprotty_task_Push',
    type: 'task:manual',
    parent: 'sprotty_sprotty',
    children: [
        {
            id: 'sprotty_task_Push_icon',
            type: 'icon',
            parent: 'sprotty_task_Push',
            children: [],
            html: ''
        },
        {
            id: 'sprotty_task_Push_label',
            type: 'label:heading',
            parent: 'sprotty_task_Push',
            children: [],
            html: 'Push'
        }
    ],
    html: 'Push'
};
const expectedGLSPLocatorData = [
    {
        locator:
            "locator('body').locator('div.sprotty:not(.sprotty-hidden)').locator('[data-svg-metadata-type=\"graph\"]').locator('[id$=\"task_Push\"]').and(locator('body').locator('div.sprotty:not(.sprotty-hidden)').locator('[data-svg-metadata-type=\"graph\"]').locator('[data-svg-metadata-type=\"task:manual\"]'))",
        children: [
            '<g id="sprotty_task_Push" transform="translate(70, 100)" data-svg-metadata-type="task:manual" data-svg-metadata-parent-id="sprotty_sprotty" class="node task manual">...</g>'
        ]
    },
    {
        locator: "locator('body').locator('div.sprotty:not(.sprotty-hidden)')",
        children: ['<div id="sprotty" class="sprotty">...</div>']
    },
    { locator: "locator('body')", children: ['<body>...</body>'] }
];

test.describe('The debug functions', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        graph = app.graph;
    });

    /**
     * It is possible to extract all the accessible SVG metadata of a locator as a tree structure.
     */
    test('should allow to extract the metadata of a locator', async () => {
        const node = await graph.getNode(taskSelector, TaskManual);

        const metadata = await extractMetaTree(node.locate());
        expect(metadata).toMatchObject(expectedElementMetadata);
    });

    /**
     * It is possible to retrieve all the located HTML elements of a GLSPLocator and it's ascendants.
     */
    test('should allow to extract debug information of a GLSPLocator', async () => {
        const node = await graph.getNode(taskSelector, TaskManual);

        const extracted = await extractDebugInformationOfGLSPLocator(node.locator);
        expect(extracted).toMatchObject(expectedGLSPLocatorData);
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
