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
import { Locator } from '@playwright/test';
import { SVGMetadata } from '~/glsp/graph/svg-metadata-api';

export interface DebugNode {
    id: string | null;
    type: string | null;
    parent: string | null;
    html: string | null;
    children: DebugNode[];
}

/**
 * Extracts the SVG Metadata tree from a locator for debugging purposes.
 *
 * @param locator Locator of the element
 * @returns The SVG Metadata tree of the node
 */
export async function extractMetaTree(locator: Locator): Promise<DebugNode> {
    const children: DebugNode[] = [];
    for (const loc of await locator.locator(`> [${SVGMetadata.type}]`).all()) {
        const child = await extractMetaTree(loc);
        children.push(child);
    }

    const element = await extractElement(locator);
    return {
        ...element,
        children
    };
}

/**
 * Extracts for a single element the SVG Metadata
 *
 * @param locator Locator of the element
 * @returns For a single node the SVG Metadata
 */
export async function extractElement(locator: Locator): Promise<DebugNode> {
    return {
        id: await locator.getAttribute('id'),
        type: await locator.getAttribute(SVGMetadata.type),
        parent: await locator.getAttribute(SVGMetadata.parentId),
        children: [],
        html: await (await locator.allTextContents()).join(',')
    };
}
