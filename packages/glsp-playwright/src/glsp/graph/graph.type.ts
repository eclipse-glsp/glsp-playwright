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
import type { PEdge } from './elements/edge';
import type { PModelElement } from './elements/element';
import type { PNodeConstructor } from './elements/node';
import type { BothTypedEdge, SourceTypedEdge, TargetTypedEdge } from './elements/typed-edge/typed-edge.type';

export interface EdgeConstructorOptions {
    sourceConstructor?: PNodeConstructor<any>;
    targetConstructor?: PNodeConstructor<any>;
}

export interface EdgeSearchOptions extends EdgeConstructorOptions {
    sourceSelector?: string;
    targetSelector?: string;
}

export type TypedEdge<TElement extends PEdge, TOptions extends EdgeConstructorOptions> = TOptions extends {
    sourceConstructor: PNodeConstructor<infer TSource>;
    targetConstructor: PNodeConstructor<infer TTarget>;
}
    ? TElement & BothTypedEdge<TSource, TTarget>
    : TOptions extends { sourceConstructor: PNodeConstructor<infer TSource> }
    ? TElement & SourceTypedEdge<TSource>
    : TOptions extends { targetConstructor: PNodeConstructor<infer TTarget> }
    ? TElement & TargetTypedEdge<TTarget>
    : TElement;

export interface ElementQuery<TElement extends PModelElement> {
    elementType: string;
    all: () => Promise<TElement[]>;
}
