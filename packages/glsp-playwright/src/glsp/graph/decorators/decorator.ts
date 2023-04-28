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
import { PEdge, PEdgeConstructor, PModelElement, PModelElementConstructor, PNode, PNodeConstructor } from '~/glsp';
import type { ConstructorT } from '~/types';
import type { EdgeMetadata } from './edge.decorator';
import type { ModelElementMetadata } from './html.decorator';
import type { NodeMetadata } from './node.decorator';

export const metadataKey = Symbol.for('metadata');

/**
 * Utility functions to interact with the [Metadata](https://github.com/eclipse-glsp/glsp-playwright/docs/concepts/metadata.md)
 * of page objects.
 */
export namespace PMetadata {
    /**
     * Returns the `metadata` of a target.
     * It throws an error if the metadata does not exist.
     *
     * @param target Constructor with the `metadata`
     * @returns Metadata of the page object
     */
    export function assert(target: PNodeConstructor): NodeMetadata;
    export function assert(target: PEdgeConstructor): EdgeMetadata;
    export function assert(target: PModelElementConstructor): ModelElementMetadata;
    export function assert(target: ConstructorT<any, any>): ModelElementMetadata;
    export function assert(target: ConstructorT<any, any>): ModelElementMetadata {
        if (!Reflect.hasMetadata(metadataKey, target)) {
            throw Error(`Provided target "${target.name ?? target}" has no metadata. Did you use the class decorator?`);
        }

        return Reflect.getMetadata(metadataKey, target);
    }

    /**
     * Returns the `metadata` of a target.
     * It throws an error if the metadata does not exist.
     *
     * @param target Object with the `metadata`
     * @returns Metadata of the page object
     */
    export function assertOwn(target: PNode): NodeMetadata;
    export function assertOwn(target: PEdge): EdgeMetadata;
    export function assertOwn(target: PModelElement): ModelElementMetadata;
    export function assertOwn(target: object): ModelElementMetadata;
    export function assertOwn(target: object): ModelElementMetadata {
        if (!Reflect.hasOwnMetadata(metadataKey, target)) {
            throw Error(`Provided target "${target.constructor.name ?? target}" has no own metadata. Did you use the class decorator?`);
        }

        return Reflect.getOwnMetadata(metadataKey, target);
    }

    /**
     * Defines the provided `metadata` on the target.
     *
     * @param target Object on which to define the metadata
     * @param metadata Metadata to attach
     */
    export function add<TMetadata extends ModelElementMetadata = ModelElementMetadata>(target: object, metadata: TMetadata): void {
        Reflect.defineMetadata(metadataKey, metadata, target);
    }

    /**
     * Retrieves the `type` entry of the `metadata`
     *
     * @param target Object which has the metadata
     * @returns Type of the target
     */
    export function getType(target: ConstructorT<any, any>): string {
        return assert(target).type;
    }
}
