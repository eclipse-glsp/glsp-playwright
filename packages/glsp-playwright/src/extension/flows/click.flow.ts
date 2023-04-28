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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { Locator } from '@playwright/test'; // For documentation
import type { Locateable } from '~/remote';
import type { ConstructorA } from '../../types';
import type { Flow } from '../types';

/**
 * Flow for clicking on an element.
 */
export interface Clickable {
    /**
     * Click the element.
     *
     * @param options
     */
    click(options?: {
        button?: 'left' | 'right' | 'middle';
        clickCount?: number;
        delay?: number;
        force?: boolean;
        modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>;
        noWaitAfter?: boolean;
        position?: {
            x: number;

            y: number;
        };
        timeout?: number;
        trial?: boolean;
    }): Promise<void>;

    /**
     * Double click the element.
     *
     * @param options
     */
    dblclick(options?: {
        button?: 'left' | 'right' | 'middle';
        delay?: number;
        force?: boolean;
        modifiers?: Array<'Alt' | 'Control' | 'Meta' | 'Shift'>;
        noWaitAfter?: boolean;
        position?: {
            x: number;

            y: number;
        };
        timeout?: number;
        trial?: boolean;
    }): Promise<void>;
}

/**
 * The default [Extension-Provider](https://github.com/eclipse-glsp/glsp-playwright/docs/concepts/extension.md)
 * for the {@link Clickable} flow.
 *
 * **Details**
 *
 * The actions are proxied to the {@link Locator} implementation.
 *
 * @param Base Base class that should be extended
 * @returns Extended base class with the {@link Clickable} flow
 */
export function useClickableFlow<TBase extends ConstructorA<Locateable>>(Base: TBase): Flow<TBase, Clickable> {
    abstract class Mixin extends Base implements Clickable {
        /**
         * Click the element.
         *
         * **Details**
         *
         * Proxied to the Playwright {@link Locator} implementation. The method is same as executing:
         *
         * ```ts
         * page.locator(...).click(options);
         * ```
         *
         * @param options
         *
         * @see {@link Locator.click}
         */
        click(
            options?:
                | {
                      button?: 'left' | 'right' | 'middle' | undefined;
                      clickCount?: number | undefined;
                      delay?: number | undefined;
                      force?: boolean | undefined;
                      modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[] | undefined;
                      noWaitAfter?: boolean | undefined;
                      position?: { x: number; y: number } | undefined;
                      timeout?: number | undefined;
                      trial?: boolean | undefined;
                  }
                | undefined
        ): Promise<void> {
            return this.locate().click(options);
        }

        /**
         * Double click the element.
         *
         * **Details**
         *
         * Proxied to the Playwright {@link Locator} implementation. The method is same as executing:
         *
         * ```ts
         * page.locator(...).dblclick(options);
         * ```
         *
         * @param options
         *
         * @see {@link Locator.dblclick}
         */
        dblclick(
            options?:
                | {
                      button?: 'left' | 'right' | 'middle' | undefined;
                      delay?: number | undefined;
                      force?: boolean | undefined;
                      modifiers?: ('Alt' | 'Control' | 'Meta' | 'Shift')[] | undefined;
                      noWaitAfter?: boolean | undefined;
                      position?: { x: number; y: number } | undefined;
                      timeout?: number | undefined;
                      trial?: boolean | undefined;
                  }
                | undefined
        ): Promise<void> {
            return this.locate().dblclick(options);
        }
    }

    return Mixin;
}
