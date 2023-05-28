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
import { waitForFunction } from '~/integration/wait.fixes';
import type { GLSPLocator } from '~/remote/locator';
import type { PModelElement } from './elements/element';
import type { ElementQuery } from './graph.type';
import { SVGMetadataUtils } from './svg-metadata-api';

/**
 * Determines the elements before and after an operation has been triggered.
 *
 * @param query Query to search for the elements in the graph before and after the operation
 * @param operation Operation to trigger
 * @param waitForOperation Promise to wait after the operation has been executed
 * @returns Elements before and after the operations
 */
export async function waitForElementChanges<TElement extends PModelElement>(
    query: ElementQuery<TElement>,
    operation: () => Promise<void>,
    waitForOperation: (elements: TElement[]) => Promise<void>
): Promise<{
    before: TElement[];
    after: TElement[];
}> {
    const before = await query.all();

    await operation();
    await waitForOperation(before);

    const after = await query.all();

    return {
        before,
        after
    };
}

/**
 * Waits for the elements to increase in the remote page
 *
 * @param locator Locator of the elements
 * @param query For querying the remote page for the added elements
 * @param numberBefore The number of elements that were accessible before
 */
export async function waitForElementIncrease<TElement extends PModelElement>(
    locator: GLSPLocator,
    query: ElementQuery<TElement>,
    numberBefore: number
): Promise<void> {
    await waitForFunction(async () => {
        const elements = await locator.locate().locator(SVGMetadataUtils.typeAttrOf(query.elementType)).all();

        return !!elements && elements.length > numberBefore;
    });

    // wait for additional elements to become accessible from the outside
    for (let i = 0; i < 10; i++) {
        const elements = await query.all();
        if (elements.length > numberBefore) {
            return;
        }
        await locator.page.waitForTimeout(500);
    }
    throw Error('Timeout while waiting for number of graph elements to increase');
}
