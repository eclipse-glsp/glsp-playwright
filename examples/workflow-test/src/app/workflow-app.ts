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
import { Clickable, InteractablePosition } from '@eclipse-glsp/glsp-playwright';
import { GLSPApp } from '@eclipse-glsp/glsp-playwright/glsp';
import { WorkflowToolPalette } from '../features/tool-palette/workflow-tool-palette';
import { Edge } from '../graph/elements/edge.po';
import { TaskManual } from '../graph/elements/task-manual.po';
import { WorkflowGraph } from '../graph/workflow.graph';

export class WorkflowApp extends GLSPApp {
    override readonly graph: WorkflowGraph;
    override readonly toolPalette: WorkflowToolPalette;

    protected override createGraph(): WorkflowGraph {
        return new WorkflowGraph({ locator: WorkflowGraph.locate(this) });
    }

    protected override createToolPalette(): WorkflowToolPalette {
        return new WorkflowToolPalette({ locator: WorkflowToolPalette.locate(this) });
    }

    async createManualTask(position: InteractablePosition): Promise<TaskManual> {
        const newNodes = await this.graph.waitForCreationOfNodeType(TaskManual, async () => {
            const automatedTaskPaletteItem = await this.toolPalette.content.toolElement('Nodes', 'Manual Task');
            await automatedTaskPaletteItem.click();
            await position.click();
        });
        return newNodes[0];
    }

    async createEdge(source: Clickable, target: Clickable): Promise<Edge> {
        const newEdges = await this.graph.waitForCreationOfEdgeType(Edge, async () => {
            const edgePaletteItem = await this.toolPalette.content.toolElement('Edges', 'Edge');
            await edgePaletteItem.click();
            await source.click();
            await target.click();
        });
        return newEdges[0];
    }
}
