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
import { asLocator, type GLSPLocator } from '~/remote';
import { definedAttr, isUndefinedOrValue } from '~/utils/ts.utils';
import { ModelElementMetadata, PMetadata } from './decorators';
import { assertEqualType, createTypedEdgeProxy, getPModelElementConstructorOfType } from './elements';
import { isPEdgeConstructor, PEdge, PEdgeConstructor } from './elements/edge';
import { isEqualLocatorType, PModelElement, PModelElementConstructor } from './elements/element';
import { isPNodeConstructor, PNode, PNodeConstructor } from './elements/node';
import type { EdgeConstructorOptions, EdgeSearchOptions, ElementQuery, GraphConstructorOptions, TypedEdge } from './graph.type';
import { waitForElementChanges, waitForElementIncrease } from './graph.wait';
import { SVGMetadata, SVGMetadataUtils } from './svg-metadata-api';

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
@ModelElementMetadata({
    type: 'graph'
})
export class GLSPGraph extends PModelElement {
    static locate(app: GLSPApp): GLSPLocator {
        return app.locator.child(SVGMetadataUtils.typeAttrOf('graph'));
    }

    constructor(protected readonly options: GLSPGraphOptions) {
        super({
            locator: options.locator
        });
    }

    async getModelElement<TElement extends PModelElement>(
        selectorOrLocator: string | Locator,
        constructor: PModelElementConstructor<TElement>,
        options?: GraphConstructorOptions
    ): Promise<TElement> {
        const locator = asLocator(selectorOrLocator, selector => this.locator.child(selector).locate());
        const element = new constructor({ locator: this.locator.override(locator) });
        if (options === undefined || isUndefinedOrValue(options.assert, true)) {
            await assertEqualType(element);
            await element.snapshot();
        }
        return element;
    }

    async getModelElementsOfType<TElement extends PModelElement>(
        constructor: PModelElementConstructor<TElement>,
        options?: GraphConstructorOptions
    ): Promise<TElement[]> {
        return this.getModelElements(this.locate().locator(SVGMetadataUtils.typeAttrOf(constructor)), constructor, options);
    }

    async getModelElements<TElement extends PModelElement>(
        selectorOrLocator: string | Locator,
        constructor: PModelElementConstructor<TElement>,
        options?: GraphConstructorOptions
    ): Promise<TElement[]> {
        const locator = asLocator(selectorOrLocator, selector => this.locator.child(selector).locate());
        const elements: TElement[] = [];

        for await (const childLocator of await locator.all()) {
            if ((await childLocator.count()) > 0) {
                const id = await childLocator.getAttribute('id');
                if (id !== null && (await isEqualLocatorType(childLocator, constructor))) {
                    elements.push(await this.getModelElement(`#${id}`, constructor, options));
                }
            }
        }

        return elements;
    }

    async getAllModelElements(): Promise<PModelElement[]> {
        return this.getModelElements(`[${SVGMetadata.type}]`, PModelElement);
    }

    async getNode<TElement extends PNode>(
        selectorOrLocator: string | Locator,
        constructor: PNodeConstructor<TElement>,
        options?: GraphConstructorOptions
    ): Promise<TElement> {
        const locator = asLocator(selectorOrLocator, selector => this.locator.child(selector).locate());
        const element = new constructor({
            locator: this.locator.override(locator.and(this.locate().locator(SVGMetadataUtils.typeAttrOf(constructor))))
        });
        if (options === undefined || isUndefinedOrValue(options.assert, true)) {
            await assertEqualType(element);
        }
        return element;
    }

    async getNodesOfType<TElement extends PNode>(
        constructor: PNodeConstructor<TElement>,
        options?: GraphConstructorOptions
    ): Promise<TElement[]> {
        return this.getNodes(this.locate().locator(SVGMetadataUtils.typeAttrOf(constructor)), constructor, options);
    }

    async getNodes<TElement extends PNode>(
        selectorOrLocator: string | Locator,
        constructor: PNodeConstructor<TElement>,
        options?: GraphConstructorOptions
    ): Promise<TElement[]> {
        const locator = asLocator(selectorOrLocator, selector => this.locator.child(selector).locate());
        const elements: TElement[] = [];

        for await (const childLocator of await locator.all()) {
            if ((await childLocator.count()) > 0) {
                const id = await childLocator.getAttribute('id');
                if (id !== null && (await isEqualLocatorType(childLocator, constructor))) {
                    elements.push(await this.getNode(`#${id}`, constructor, options));
                }
            }
        }

        return elements;
    }

    async getEdge<TElement extends PEdge, TOptions extends EdgeConstructorOptions>(
        selectorOrLocator: string | Locator,
        constructor: PEdgeConstructor<TElement>,
        options?: TOptions
    ): Promise<TypedEdge<TElement, TOptions>> {
        const locator = asLocator(selectorOrLocator, selector => this.locator.child(selector).locate());
        const element = new constructor({
            locator: this.locator.override(locator.and(this.locate().locator(SVGMetadataUtils.typeAttrOf(constructor))))
        });
        await assertEqualType(element);
        return createTypedEdgeProxy<TElement, TOptions>(element, options);
    }

    async getEdgesOfType<TElement extends PEdge, TOptions extends EdgeSearchOptions>(
        constructor: PEdgeConstructor<TElement>,
        options?: TOptions
    ): Promise<TypedEdge<TElement, TOptions>[]> {
        const elements: TypedEdge<TElement, TOptions>[] = [];

        let query = SVGMetadataUtils.typeAttrOf(constructor);
        if (options?.sourceId) {
            query += `[${SVGMetadata.Edge.sourceId}="${options.sourceId}"]`;
        } else if (options?.targetId) {
            query += `[${SVGMetadata.Edge.targetId}="${options.targetId}"]`;
        }

        for await (const locator of await this.locate().locator(query).all()) {
            const id = await locator.getAttribute('id');
            if (id !== null && (await isEqualLocatorType(locator, constructor))) {
                const element = await this.getEdge(`#${id}`, constructor, options);
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

                if (options?.sourceSelectorOrLocator) {
                    const sourceLocator = asLocator(options.sourceSelectorOrLocator, selector => this.locate().locator(selector));
                    const sourceId = await element.sourceId();
                    const expectedId = await definedAttr(sourceLocator, 'id');
                    sourceChecks.push(expectedId.includes(sourceId));
                }

                if (options?.targetSelectorOrLocator) {
                    const targetLocator = asLocator(options.targetSelectorOrLocator, selector => this.locate().locator(selector));
                    const targetId = await element.targetId();
                    const expectedId = await definedAttr(targetLocator, 'id');
                    sourceChecks.push(expectedId.includes(targetId));
                }

                if (sourceChecks.every(c => c) && targetChecks.every(c => c)) {
                    elements.push(element);
                }
            }
        }

        return elements;
    }

    /**
     * Focuses the graph by clicking on it
     */
    async focus(): Promise<void> {
        await this.locate().click();
    }

    async waitForCreationOfType<TElement extends PModelElement>(
        constructor: PModelElementConstructor<TElement>,
        creator: () => Promise<void>
    ): Promise<TElement[]> {
        const elementType = PMetadata.getType(constructor);

        const ids = await this.waitForCreation(elementType, creator);

        let retriever = this.getModelElement.bind(this);
        if (isPNodeConstructor(constructor)) {
            retriever = this.getNode.bind(this) as any;
        } else if (isPEdgeConstructor(constructor)) {
            retriever = this.getEdge.bind(this) as any;
        }

        return Promise.all(ids.map(id => retriever(`#${id}`, constructor)));
    }

    async waitForCreation(elementType: string, creator: () => Promise<void>): Promise<string[]> {
        const query: ElementQuery<PModelElement> = {
            elementType,
            all: () => this.getModelElementsOfType(getPModelElementConstructorOfType(elementType)),
            filter: async elements => {
                const filtered: PModelElement[] = [];

                for (const element of elements) {
                    const css = await element.classAttr();
                    if (css && !css.includes('ghost-element')) {
                        filtered.push(element);
                    }
                }

                return filtered;
            }
        };

        const { before, after } = await waitForElementChanges(query, creator, b => waitForElementIncrease(this.locator, query, b.length));

        const beforeIds = await Promise.all(before.map(async element => element.idAttr()));
        const afterIds = await Promise.all(after.map(async element => element.idAttr()));

        return afterIds.filter(id => !beforeIds.includes(id));
    }
}
