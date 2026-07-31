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

import { expect, test } from '@eclipse-glsp/playwright';
import { WorkflowApp } from '../../../src/app/workflow-app';
import { TaskManual } from '../../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../../src/graph/workflow.graph';

// Deselecting through `Escape` is only bound in the standalone GLSP-Client; the IDE
// integrations consume the key themselves. The `.standalone.spec` suffix keeps this file
// out of the integration projects.
test.describe('The select feature', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        await app.waitForReady();
        graph = app.graph;
    });

    test('should allow to deselect a single element through a keybinding', async () => {
        const page = app.page;
        const element = await graph.getNodeByLabel('Push', TaskManual);
        await element.select();
        await expect(graph).toHaveSelected({
            type: TaskManual,
            elements: [element]
        });

        // Selection
        await page.keyboard.press('Escape');

        await expect(graph).toBeUnselected();
    });
});
