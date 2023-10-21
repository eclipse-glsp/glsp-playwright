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
import { GLSPApp, expect, test } from '@eclipse-glsp/glsp-playwright/';
import { dedent } from 'ts-dedent';
import { WorkflowApp } from '../../src/app/workflow-app';
import { TaskManual } from '../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../src/graph/workflow.graph';

test.describe('The popup', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = await GLSPApp.loadApp(WorkflowApp, {
            type: 'integration',
            integration
        });
        graph = app.graph;
    });

    test('should be shown on hover', async () => {
        const task = await graph.getNodeBySelector('[id$="task0"]', TaskManual);
        await task.hover();

        const popup = task.popup();
        const text = await popup.innerText();

        const expected = dedent`Push
        Type: manual
        Duration: undefined
        Reference: undefined
        
        `;
        expect(text).toBe(expected);

        await graph.deselect();
        await popup.waitForHidden();

        expect(await app.popup.classAttr()).toContain('sprotty-popup-closed');
    });

    test('should allow to access the text directly in elements', async () => {
        const task = await graph.getNodeBySelector('[id$="task0"]', TaskManual);

        const text = await task.popupText();

        const expected = dedent`Push
        Type: manual
        Duration: undefined
        Reference: undefined
        
        `;
        expect(text).toBe(expected);
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
