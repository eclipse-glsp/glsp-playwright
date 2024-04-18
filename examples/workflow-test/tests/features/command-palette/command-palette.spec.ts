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
import { GLSPGlobalCommandPalette, expect, test } from '@eclipse-glsp/glsp-playwright/';
import { WorkflowApp } from '../../../src/app/workflow-app';
import { Edge } from '../../../src/graph/elements/edge.po';
import { TaskAutomated } from '../../../src/graph/elements/task-automated.po';
import { TaskManual } from '../../../src/graph/elements/task-manual.po';
import { WorkflowGraph } from '../../../src/graph/workflow.graph';

test.describe('The command palette', () => {
    let app: WorkflowApp;
    let graph: WorkflowGraph;
    let globalCommandPalette: GLSPGlobalCommandPalette;

    test.beforeEach(async ({ integration }) => {
        app = new WorkflowApp({
            type: 'integration',
            integration
        });
        graph = app.graph;
        globalCommandPalette = app.globalCommandPalette;
    });

    test.describe('in the global context', () => {
        test('should allow to search suggestions', async () => {
            expect(await globalCommandPalette.isHidden()).toBeTruthy();

            await globalCommandPalette.open();
            expect(await globalCommandPalette.isVisible()).toBeTruthy();

            const suggestions = await globalCommandPalette.suggestions();
            const expectedSuggestions = [
                'Create Manual Task',
                'Create Category',
                'Create Automated Task',
                'Create Merge Node',
                'Create Decision Node',
                'Delete All',
                'Reveal Push',
                'Reveal ChkWt',
                'Reveal WtOK',
                'Reveal RflWt',
                'Reveal Brew',
                'Reveal ChkTp',
                'Reveal KeepTp',
                'Reveal PreHeat'
            ];
            expect(suggestions.sort()).toEqual(expectedSuggestions.sort());

            await globalCommandPalette.search('Create');
            const createSuggestions = await globalCommandPalette.suggestions();
            const expectedCreateSuggestions = [
                'Create Manual Task',
                'Create Category',
                'Create Automated Task',
                'Create Merge Node',
                'Create Decision Node'
            ];
            expect(createSuggestions.sort()).toEqual(expectedCreateSuggestions.sort());
        });

        test('should allow to confirm suggestions', async () => {
            const before = await graph.getNodesOfType(TaskManual);

            await graph.waitForCreationOfNodeType(TaskManual, async () => {
                await globalCommandPalette.open();
                await globalCommandPalette.search('Create');
                await globalCommandPalette.confirm('Create Manual Task');
            });

            const after = await graph.getNodesOfType(TaskManual);
            expect(after.length).toBe(before.length + 1);

            const names = await Promise.all(
                after.map(async element => {
                    const label = await element.children.label();
                    return label.textContent();
                })
            );
            expect(names).toContain('ManualTask8');
        });

        test('should allow creating new elements in the diagram', async () => {
            const nodes = await graph.waitForCreationOfNodeType(TaskManual, async () => {
                const command = await app.globalCommandPalette;
                await command.open();
                await command.search('Create Manual Task', { confirm: true });
            });
            expect(nodes.length).toBe(1);
            await graph.focus();

            const newTask = nodes[0];

            const label = await newTask.children.label();
            expect(await label.textContent()).toBe('ManualTask8');
        });
    });

    test.describe('in the element context', () => {
        test('should allow to search suggestions', async () => {
            const task = await graph.getNodeBySelector('[id$="task0"]', TaskManual);

            const elementCommandPalette = await task.commandPalette();
            await elementCommandPalette.open();
            const suggestions = await elementCommandPalette.suggestions();
            const expectedSuggestions = [
                'Create Category',
                'Create Manual Task',
                'Create Merge Node',
                'Create Automated Task',
                'Create Decision Node',
                'Create Edge to Push',
                'Create Edge to WtOK',
                'Create Edge to KeepTp',
                'Create Edge to RflWt',
                'Create Edge to ChkTp',
                'Create Edge to Brew',
                'Create Edge to ChkWt',
                'Create Edge to PreHeat',
                'Create Weighted Edge to Push',
                'Create Weighted Edge to WtOK',
                'Create Weighted Edge to KeepTp',
                'Create Weighted Edge to RflWt',
                'Create Weighted Edge to ChkTp',
                'Create Weighted Edge to Brew',
                'Create Weighted Edge to ChkWt',
                'Create Weighted Edge to PreHeat',
                'Delete',
                'Reveal Push',
                'Reveal ChkWt',
                'Reveal WtOK',
                'Reveal RflWt',
                'Reveal Brew',
                'Reveal ChkTp',
                'Reveal KeepTp',
                'Reveal PreHeat'
            ];
            expect(suggestions.sort()).toEqual(expectedSuggestions.sort());

            await elementCommandPalette.search('Create');
            const createSuggestions = await elementCommandPalette.suggestions();
            const expectedCreateSuggestions = [
                'Create Manual Task',
                'Create Merge Node',
                'Create Automated Task',
                'Create Decision Node',
                'Create Category',
                'Create Edge to ChkWt',
                'Create Edge to Push',
                'Create Edge to WtOK',
                'Create Edge to PreHeat',
                'Create Edge to Brew',
                'Create Edge to ChkTp',
                'Create Edge to RflWt',
                'Create Edge to KeepTp',
                'Create Weighted Edge to ChkWt',
                'Create Weighted Edge to Push',
                'Create Weighted Edge to WtOK',
                'Create Weighted Edge to PreHeat',
                'Create Weighted Edge to Brew',
                'Create Weighted Edge to ChkTp',
                'Create Weighted Edge to RflWt',
                'Create Weighted Edge to KeepTp'
            ];
            expect(createSuggestions.sort()).toEqual(expectedCreateSuggestions.sort());
        });

        test('should allow creating new elements in the diagram', async () => {
            const task = await graph.getNodeBySelector('[id$="task0"]', TaskManual);

            const nodes = await graph.waitForCreationOfNodeType(TaskManual, async () => {
                const command = task.commandPalette();
                await command.open();
                await command.search('Create Manual Task', { confirm: true });
            });
            expect(nodes.length).toBe(1);
            await graph.focus();

            const newTask = nodes[0];

            const label = await newTask.children.label();
            expect(await label.textContent()).toBe('ManualTask8');
        });

        test('should allow creating edges in the graph', async () => {
            const source = await graph.getNodeBySelector('[id$="task0"]', TaskManual);
            const target = await graph.getNodeBySelector('[id$="task0_automated"]', TaskAutomated);

            const edges = await graph.waitForCreationOfEdgeType(Edge, async () => {
                const command = source.commandPalette();
                await command.open();

                const targetLabel = await target.children.label();
                await command.search('create edge to ' + (await targetLabel.textContent()), { confirm: true });
            });
            expect(edges.length).toBe(1);
            await graph.focus();

            const newEdge = edges[0];

            const sourceId = await newEdge.sourceId();
            expect(sourceId).toBe(await source.idAttr());

            const targetId = await newEdge.targetId();
            expect(targetId).toBe(await target.idAttr());
        });
    });

    test.afterEach(async ({ integration }) => {
        await integration?.close();
    });
});
