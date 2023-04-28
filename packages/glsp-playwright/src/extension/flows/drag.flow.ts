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
import type { Locateable } from '~/remote';
import { addToBoundingBox } from '~/utils/position.utils';
import type { ConstructorA, Position } from '../../types';
import type { Flow } from '../types';

/**
 * Flow for dragging an element.
 */
export interface Draggable {
    /**
     * Drag the element towards the absolute position and drop it.
     *
     * @param position Absolute position to move the element
     */
    dragToAbsolutePosition(position: Position): Promise<void>;

    /**
     * Drag the element towards the relative position based on the element and drop it.
     *
     * @param position Relative position based to the element
     */
    dragToRelativePosition(position: Position): Promise<void>;

    /**
     * Drag the element towards the target element and drop it.
     *
     * @param target Locator of the element to drag to
     * @param options
     */
    dragTo(
        target: Locator,
        options?: {
            force?: boolean;
            noWaitAfter?: boolean;
            sourcePosition?: {
                x: number;
                y: number;
            };
            targetPosition?: {
                x: number;
                y: number;
            };
            timeout?: number;
            trial?: boolean;
        }
    ): Promise<void>;
}

/**
 * The default [Extension-Provider](https://github.com/eclipse-glsp/glsp-playwright/docs/concepts/extension.md)
 * for the {@link Draggable} flow.
 *
 * **Details**
 *
 * The dragging is done by using the mouse.
 *
 * @param Base Base class that should be extended
 * @returns Extended base class with the {@link Deletable} flow
 */
export function useDraggableFlow<TBase extends ConstructorA<Locateable>>(Base: TBase): Flow<TBase, Draggable> {
    abstract class Mixin extends Base implements Draggable {
        readonly #mouse = this.locator.page.mouse;

        async dragToAbsolutePosition(position: Position): Promise<void> {
            const bounds = await this.bounds();
            const center = bounds.position('middle_center');

            await this.#mouse.move(center.data.x, center.data.y);
            await this.#mouse.down();
            await this.#mouse.move(position.x, position.y);
            await this.#mouse.up();
        }

        async dragToRelativePosition(position: Position): Promise<void> {
            const bounds = await this.bounds();
            const center = bounds.position('middle_center');

            const target = addToBoundingBox(bounds.data, position);

            await this.#mouse.move(center.data.x, center.data.y);
            await this.#mouse.down();
            await this.#mouse.move(target.x, target.y);
            await this.#mouse.up();
        }

        /**
         * Drag the element towards the target element and drop it.
         *
         * **Details**
         *
         * Proxied to the Playwright {@link Locator} implementation. The method is same as executing:
         *
         * ```ts
         * page.locator(...).dragTo(target, options);
         * ```
         *
         * @param target Locator of the element to drag to
         * @param options
         *
         * @see {@link Locator.dragTo}
         */
        async dragTo(
            target: Locator,
            options?: {
                force?: boolean;
                noWaitAfter?: boolean;
                sourcePosition?: { x: number; y: number };
                targetPosition?: { x: number; y: number };
                timeout?: number;
                trial?: boolean;
            }
        ): Promise<void> {
            return this.locate().dragTo(target, options);
        }
    }

    return Mixin;
}
