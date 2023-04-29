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
import type { Locateable } from '~/remote';
import type { ConstructorA } from '~/types';
import type { Hoverable } from '../../flows/index';
import type { Capability } from '../../types';
import { Popup } from './popup.po';

/**
 * A popup with details on that element is triggered when the user hovers the mouse pointer over an element.
 *
 * [Learn more about popups](https://www.eclipse.org/glsp/documentation/protocol/).
 */
export interface PopupCapability<TPopup extends Popup = Popup> {
    /**
     * Access the page object of the popup of the element.
     *
     * @returns Page object of the popup
     */
    popup(): TPopup;

    /**
     * Access the text of the popup directly.
     *
     * @returns Text of the popup
     */
    popupText(): Promise<string>;
}

/**
 * The default [Extension-Provider](https://github.com/eclipse-glsp/glsp-playwright/docs/concepts/extension.md)
 * for the {@link PopupCapability}.
 *
 * @param Base Base class that should be extended
 * @returns Extended base class with the {@link PopupCapability}
 */
export function usePopupCapability<TBase extends ConstructorA<Locateable & Hoverable>>(Base: TBase): Capability<TBase, PopupCapability> {
    abstract class Mixin extends Base implements PopupCapability {
        popup(): Popup {
            return new Popup(this);
        }

        async popupText(): Promise<string> {
            await this.hover();

            return this.popup().innerText();
        }
    }

    return Mixin;
}
