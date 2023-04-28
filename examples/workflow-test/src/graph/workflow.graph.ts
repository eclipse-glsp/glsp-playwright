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
import { GLSPSemanticGraph, PNode, PNodeConstructor } from '@eclipse-glsp/glsp-playwright/glsp';
import { waitForFunction } from '@eclipse-glsp/glsp-playwright/integration';

export class WorkflowGraph extends GLSPSemanticGraph {
    override async waitForCreationOfNodeType<TElement extends PNode>(
        constructor: PNodeConstructor<TElement>,
        creator: () => Promise<void>
    ): Promise<TElement[]> {
        const elements = await super.waitForCreationOfNodeType(constructor, creator);

        await waitForFunction(async () =>
            elements.every(element => element.locate().evaluate(node => node?.classList.contains('selected')))
        );
        return elements;
    }
}
