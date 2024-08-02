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
import { Selectable } from '../../extension';
import { PLabelledElement } from '../../extension/model/labelled/labelled-element.model';
import { PModelElement, PModelElementConstructor, PNode, PNodeConstructor } from './elements';
import { GLSPGraph } from './graph.po';

/**
 * The {@link GLSPSemanticGraph} allows compared to {@link GLSPGraph} semantic access.
 * Element specific knowledge (e.g., {@link PLabelledElement}) is used to search for elements.
 */
export class GLSPSemanticGraph extends GLSPGraph {
    async getNodeByLabel<TElement extends PNode & PLabelledElement>(
        label: string,
        constructor: PNodeConstructor<TElement>
    ): Promise<TElement> {
        const nodes = await this.getNodesByLabel(label, constructor);

        if (nodes.length > 1) {
            throw new Error('More than one element selected');
        } else if (nodes.length === 0) {
            throw new Error('No element selected');
        }

        return nodes[0];
    }

    async getNodesByLabel<TElement extends PNode & PLabelledElement>(
        label: string,
        constructor: PNodeConstructor<TElement>
    ): Promise<TElement[]> {
        const nodes = await this.getNodesOfType(constructor);
        const elements: TElement[] = [];

        for (const node of nodes) {
            const nodeLabel = await node.label;
            if (nodeLabel === label) {
                elements.push(node);
            }
        }

        return elements;
    }

    async getSelectedElements<TElement extends PModelElement>(constructor: PModelElementConstructor<TElement>): Promise<TElement[]> {
        return this.getModelElements(`.${Selectable.CSS}`, constructor);
    }
}
