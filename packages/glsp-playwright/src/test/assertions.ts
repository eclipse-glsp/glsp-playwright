/********************************************************************************
 * Copyright (c) 2024 EclipseSource and others.
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
import { expect as baseExpect, ExpectMatcherState, Locator } from '@playwright/test';
import { Selectable } from '../extension';
import { GLSPSemanticGraph, PModelElement, SVGMetadataUtils } from '../glsp';
import { GLSPLocator, Locateable } from '../remote';
import { ConstructorT } from '../types';
import { unwrapLocator } from '../utils';

interface MatcherReturnType {
    message: () => string;
    pass: boolean;
    name?: string;
    expected?: unknown;
    actual?: any;
    log?: string[];
}

/* eslint-disable no-invalid-this */
async function toBeSelected(this: ExpectMatcherState, element: PModelElement): Promise<MatcherReturnType> {
    const assertionName = 'toBeSelected';
    let pass: boolean;
    let matcherResult: any;

    try {
        await toContainClass.call(this, element, Selectable.CSS);
        pass = true;
    } catch (e: any) {
        matcherResult = e.matcherResult;
        pass = false;
    }

    return {
        message: () =>
            this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            assertionName +
            ' - Assertions\n' +
            matcherResult.message,
        pass,
        name: assertionName,
        expected: Selectable.CSS,
        actual: matcherResult?.actual
    };
}

async function toHaveSelected(
    this: ExpectMatcherState,
    graph: GLSPSemanticGraph,
    expected: { type: ConstructorT<PModelElement>; elements: PModelElement[] | (() => Promise<PModelElement[]>) }
): Promise<MatcherReturnType> {
    const assertionName = 'toHaveSelected';
    let pass: boolean;
    let matcherResult: any;

    try {
        await baseExpect(graph.locate().locator(`.${Selectable.CSS}`).first()).toBeAttached();
        await baseExpect(graph.locate().locator(`.${Selectable.CSS}`).last()).toBeAttached();

        const receivedElements = await graph.getSelectedElements(expected.type);
        const expectedElements = typeof expected.elements === 'function' ? await expected.elements() : expected.elements;

        const receivedIds = await Promise.all(receivedElements.map(n => n.idAttr()));
        const expectedIds = await Promise.all(expectedElements.map(n => n.idAttr()));

        baseExpect(receivedIds).toHaveLength(expectedIds.length);
        baseExpect(receivedIds.sort()).toEqual(expectedIds.sort());
        pass = true;
    } catch (e: any) {
        matcherResult = e.matcherResult ?? e.error.message;
        pass = false;
    }

    return {
        message: () =>
            this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            assertionName +
            ' - Assertions\n' +
            matcherResult.message,
        pass,
        name: assertionName,
        expected,
        actual: matcherResult?.actual
    };
}

async function toContainElement(
    this: ExpectMatcherState,
    graph: GLSPSemanticGraph,
    expected: { type: ConstructorT<PModelElement>; query: { label: string } }
): Promise<MatcherReturnType> {
    const assertionName = 'toHaveSelected';
    let pass: boolean;
    let matcherResult: any;

    try {
        const element = await graph.getModelElement(
            `${SVGMetadataUtils.typeAttrOf(expected.type)}:has-text("${expected.query.label}")`,
            expected.type,
            { assert: false }
        );

        if (this.isNot) {
            await baseExpect(element.locate()).toBeAttached({ attached: false });
            pass = false;
        } else {
            await baseExpect(element.locate()).toBeAttached();
            pass = true;
        }
    } catch (e: any) {
        matcherResult = e.matcherResult ?? e.error.message;
        pass = false;
    }

    return {
        message: () =>
            this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            assertionName +
            ' - Assertions\n' +
            matcherResult.message,
        pass,
        name: assertionName,
        expected,
        actual: matcherResult?.actual
    };
}

async function toBeUnselected(this: ExpectMatcherState, graph: GLSPSemanticGraph): Promise<MatcherReturnType> {
    const assertionName = 'toBeUnselected';
    let pass: boolean;
    let matcherResult: any;

    try {
        await Promise.all((await graph.locate().locator(`.${Selectable.CSS}`).all()).map(l => l.waitFor({ state: 'detached' })));
        await toHaveSelected.call(this, graph, { type: PModelElement, elements: [] });
        pass = true;
    } catch (e: any) {
        matcherResult = e.matcherResult ?? e.error.message;
        pass = false;
    }

    return {
        message: () =>
            this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            assertionName +
            ' - Assertions\n' +
            matcherResult.message,
        pass,
        name: assertionName
    };
}

async function toContainClass(
    this: ExpectMatcherState,
    target: Locator | GLSPLocator | Locateable,
    expected: string
): Promise<MatcherReturnType> {
    const assertionName = 'toContainClass';
    let pass: boolean;
    let matcherResult: any;

    try {
        const locator = unwrapLocator(target);

        if (this.isNot) {
            await baseExpect(locator).not.toHaveClass(new RegExp(expected));
            pass = false;
        } else {
            await baseExpect(locator).toHaveClass(new RegExp(expected));
            pass = true;
        }
    } catch (e: any) {
        matcherResult = e.matcherResult ?? e.error.message;
        pass = false;
    }

    return {
        message: () =>
            this.utils.matcherHint(assertionName, undefined, undefined, { isNot: this.isNot }) +
            '\n\n' +
            assertionName +
            ' - Assertions\n' +
            matcherResult.message,
        pass,
        name: assertionName,
        expected,
        actual: matcherResult?.actual
    };
}

/* eslint-enable no-invalid-this */

export const expect = baseExpect.extend({
    toHaveSelected,
    toBeUnselected,
    toContainClass,
    toBeSelected,
    toContainElement
});
