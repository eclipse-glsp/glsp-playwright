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
import type { Locator } from '@playwright/test';
import type { GLSPApp } from '~/glsp';
import type { GLSPLocator } from '~/remote';
import { Locateable } from '~/remote/locateable';
import { definedAttr } from '~/utils/ts.utils';
import { PMetadata } from './decorators';
import { assertEqualType, createTypedEdgeProxy, getPModelElementConstructorOfType } from './elements';
import type { PEdge, PEdgeConstructor } from './elements/edge';
import type { PModelElement, PModelElementConstructor } from './elements/element';
import type { PNode, PNodeConstructor } from './elements/node';
import type { EdgeConstructorOptions, EdgeSearchOptions, ElementQuery, TypedEdge } from './graph.type';
import { waitForElementChanges, waitForElementIncrease } from './graph.wait';
import { SVGMetadataUtils } from './svg-metadata-api';

export interface GLSPGraphOptions {
    locator: GLSPLocator;
}

/**
 * The {@link GLSPGraph} interacts with the graph (e.g., SVG) part of the GLSP-Client.
 * It provides basic functionality like searching for specific elements or to wait for their creation.
 *
 * **Note**
 *
 * The {@link GLSPGraph} is language-agnostic, that means it has no semantic knowledge.
 * It works directy with the underlying DOM by using the selector, {@link Locator},
 * or constructor (e.g., {@link PModelElementConstructor}) of an element.
 */
export class GLSPGraph extends Locateable {
    static locate(app: GLSPApp): GLSPLocator {
        return app.locator.child(SVGMetadataUtils.typeAttrOf('graph')).child('svg.sprotty-graph');
    }

    constructor(protected readonly options: GLSPGraphOptions) {
        super(options.locator);
    }

    async getModelElementBySelector<TElement extends PModelElement>(
        selector: string,
        constructor: PModelElementConstructor<TElement>
    ): Promise<TElement> {
        return this.getModelElementByLocator(this.locator.child(selector).locate(), constructor);
    }

    async getModelElementByLocator<TElement extends PModelElement>(
        locator: Locator,
        constructor: PModelElementConstructor<TElement>
    ): Promise<TElement> {
        const element = new constructor({ locator: this.locator.override(locator) });
        await assertEqualType(element);
        return element;
    }

    async getModelElementsOfType<TElement extends PModelElement>(constructor: PModelElementConstructor<TElement>): Promise<TElement[]> {
        return this.getModelElementsByLocator(this.locate().locator(SVGMetadataUtils.typeAttrOf(constructor)), constructor);
    }

    async getModelElementsBySelector<TElement extends PModelElement>(
        selector: string,
        constructor: PModelElementConstructor<TElement>
    ): Promise<TElement[]> {
        return this.getModelElementsByLocator(this.locator.child(selector).locate(), constructor);
    }

    async getModelElementsByLocator<TElement extends PModelElement>(
        locator: Locator,
        constructor: PModelElementConstructor<TElement>
    ): Promise<TElement[]> {
        const elements: TElement[] = [];

        for await (const childLocator of await locator.all()) {
            const id = await definedAttr(childLocator, 'id');
            elements.push(await this.getModelElementBySelector(`#${id}`, constructor));
        }

        return elements;
    }

    async getNodeBySelector<TElement extends PNode>(selector: string, constructor: PNodeConstructor<TElement>): Promise<TElement> {
        return this.getNodeByLocator(this.locator.child(selector).locate(), constructor);
    }

    async getNodeByLocator<TElement extends PNode>(locator: Locator, constructor: PNodeConstructor<TElement>): Promise<TElement> {
        const element = new constructor({ locator: this.locator.override(locator) });
        await assertEqualType(element);
        return element;
    }

    async getNodesOfType<TElement extends PNode>(constructor: PNodeConstructor<TElement>): Promise<TElement[]> {
        return this.getNodesByLocator(this.locate().locator(SVGMetadataUtils.typeAttrOf(constructor)), constructor);
    }

    async getNodesBySelector<TElement extends PNode>(selector: string, constructor: PNodeConstructor<TElement>): Promise<TElement[]> {
        return this.getNodesByLocator(this.locator.child(selector).locate(), constructor);
    }

    async getNodesByLocator<TElement extends PNode>(locator: Locator, constructor: PNodeConstructor<TElement>): Promise<TElement[]> {
        const elements: TElement[] = [];

        for await (const childLocator of await locator.all()) {
            const id = await definedAttr(childLocator, 'id');
            elements.push(await this.getNodeBySelector(`#${id}`, constructor));
        }

        return elements;
    }

    async getEdgeBySelector<TElement extends PEdge, TOptions extends EdgeConstructorOptions>(
        selector: string,
        constructor: PEdgeConstructor<TElement>,
        options?: TOptions
    ): Promise<TypedEdge<TElement, TOptions>> {
        const element = new constructor({
            locator: this.locator.child(selector)
        });
        await assertEqualType(element);
        return createTypedEdgeProxy<TElement, TOptions>(element, options);
    }

    async getEdgesOfType<TElement extends PEdge, TOptions extends EdgeSearchOptions>(
        constructor: PEdgeConstructor<TElement>,
        options?: TOptions
    ): Promise<TypedEdge<TElement, TOptions>[]> {
        const elements: TypedEdge<TElement, TOptions>[] = [];

        for await (const locator of await this.locate().locator(SVGMetadataUtils.typeAttrOf(constructor)).all()) {
            const id = await definedAttr(locator, 'id');
            const element = await this.getEdgeBySelector(`#${id}`, constructor, options);
            const sourceChecks = [];
            const targetChecks = [];

            if (options?.sourceConstructor) {
                const sourceId = await element.sourceId();
                sourceChecks.push(
                    (await this.locate()
                        .locator(`[id$="${sourceId}"]${SVGMetadataUtils.typeAttrOf(options.sourceConstructor)}`)
                        .count()) > 0
                );
            }

            if (options?.targetConstructor) {
                const targetId = await element.targetId();
                targetChecks.push(
                    (await this.locate()
                        .locator(`[id$="${targetId}"]${SVGMetadataUtils.typeAttrOf(options.targetConstructor)}`)
                        .count()) > 0
                );
            }

            if (options?.sourceSelector) {
                const sourceId = await element.sourceId();
                const expectedId = await definedAttr(this.locate().locator(options.sourceSelector), 'id');
                sourceChecks.push(expectedId.includes(sourceId));
            }

            if (options?.targetSelector) {
                const targetId = await element.targetId();
                const expectedId = await definedAttr(this.locate().locator(options.targetSelector), 'id');
                sourceChecks.push(expectedId.includes(targetId));
            }

            if (sourceChecks.every(c => c) && targetChecks.every(c => c)) {
                elements.push(element);
            }
        }

        return elements;
    }

    async deselect(): Promise<void> {
        await this.locate().click();
        await this.locate().focus();
    }

    async waitForCreationOfNodeType<TElement extends PNode>(
        constructor: PNodeConstructor<TElement>,
        creator: () => Promise<void>
    ): Promise<TElement[]> {
        const elements = await this.waitForCreationOfType(constructor, creator);
        return Promise.all(elements.map(async element => this.getNodeBySelector(`#${await element.idAttr()}`, constructor)));
    }

    async waitForCreationOfEdgeType<TElement extends PEdge>(
        constructor: PEdgeConstructor<TElement>,
        creator: () => Promise<void>
    ): Promise<TElement[]> {
        const elements = await this.waitForCreationOfType(constructor, creator);
        return Promise.all(elements.map(async element => this.getEdgeBySelector(`#${await element.idAttr()}`, constructor)));
    }

    async waitForCreationOfType(type: string, creator: () => Promise<void>): Promise<string[]>;
    async waitForCreationOfType<TElement extends PModelElement>(
        type: PModelElementConstructor<TElement>,
        creator: () => Promise<void>
    ): Promise<TElement[]>;
    async waitForCreationOfType<TElement extends PModelElement>(
        type: string | PModelElementConstructor<TElement>,
        creator: () => Promise<void>
    ): Promise<(string | TElement)[]> {
        const elementType = typeof type === 'string' ? type : PMetadata.getType(type);
        const query: ElementQuery<PModelElement> = {
            elementType: elementType,
            all: () => this.getModelElementsOfType(getPModelElementConstructorOfType(elementType))
        };

        const { before, after } = await waitForElementChanges(query, creator, b => waitForElementIncrease(this.locator, query, b.length));

        const beforeIds = await Promise.all(before.map(async element => element.idAttr()));
        const afterIds = await Promise.all(after.map(async element => element.idAttr()));

        const newIds = afterIds.filter(id => !beforeIds.includes(id));

        if (typeof type === 'string') {
            return newIds;
        }

        return Promise.all(newIds.map(id => this.getModelElementBySelector(`#${id}`, type)));
    }
}
