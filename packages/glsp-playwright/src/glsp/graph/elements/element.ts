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
import { extractMetaTree } from '~/debugger/extractor';
import { GLSPLocator, Locateable } from '~/remote';
import type { ConstructorT } from '~/types/constructor';
import { definedGLSPAttr } from '~/utils/ts.utils';
import { ModelElementMetadata, PMetadata } from '../decorators';
import { SVGMetadata } from '../svg-metadata-api';

export async function assertEqualType(element: PModelElement): Promise<void> {
    const located = element.locate();
    const count = await located.count();

    if (count !== 1) {
        for await (const locator of await located.all()) {
            console.error('=========== Element ==========');
            console.error(await locator.evaluate(elem => elem.outerHTML));
        }

        throw Error(
            `Assertion failed. Locator did not find single element in the DOM. 
            It found ${count} elements for type ${element._metadata.type}. 
            Executed query: ${element.locate()}`
        );
    }

    if (!(await isEqualType(element))) {
        throw Error(
            `Assertion failed. Expected type '${
                element._metadata.type
            }', but it was '${await element.typeAttr()}'. Id = ${await element.idAttr()}`
        );
    }
}

export async function isEqualType(element: PModelElement): Promise<boolean> {
    const typeAttr = await element.typeAttr();
    return element._metadata.type === '*' || typeAttr === element._metadata.type;
}

export async function isEqualLocatorType(locator: Locator, constructor: PModelElementConstructor): Promise<boolean> {
    const typeAttr = await locator.getAttribute(SVGMetadata.type);
    const constructorType = PMetadata.getType(constructor);

    return typeAttr !== null && (constructorType === '*' || typeAttr === constructorType);
}

export interface PModelElementData {
    locator: GLSPLocator;
}

export type PModelElementConstructor<TElement extends PModelElement = PModelElement> = ConstructorT<TElement, [PModelElementData]>;

@ModelElementMetadata({
    type: '*'
})
export class PModelElement extends Locateable {
    readonly graph;
    readonly _metadata;

    constructor(data: PModelElementData) {
        super(data.locator);
        this.graph = this.app.graph;
        this._metadata = PMetadata.assertOwn(this.constructor);
    }

    async typeAttr(): Promise<string> {
        return definedGLSPAttr(this.locator, SVGMetadata.type);
    }

    async idAttr(): Promise<string> {
        return definedGLSPAttr(this.locator, 'id');
    }

    async classAttr(): Promise<string | null> {
        return this.locate().getAttribute('class');
    }

    async debug(): Promise<void> {
        console.log(`Id: ${await this.idAttr()}`);
        console.log(`type: ${await this.typeAttr()}`);
        console.log(`class: ${await this.classAttr()}`);
        console.log('Tree:');
        const tree = await extractMetaTree(this.locate());
        console.log(tree);
    }
}

export function getPModelElementConstructorOfType(type: string): PModelElementConstructor {
    @ModelElementMetadata({
        type
    })
    class Anon extends PModelElement {}

    return Anon;
}
