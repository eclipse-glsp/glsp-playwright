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
import type { Locator, Page } from '@playwright/test';
import type { GLSPApp } from '../glsp/app/app.po';
import { InteractableBoundingBox, interactableBoundsOf } from './browser/interactable';
import type { GLSPLocator } from './locator';

/**
 * Root class of all locateable page objects.
 */
export class Locateable {
    constructor(public readonly locator: GLSPLocator) {}

    get app(): GLSPApp {
        return this.locator.app;
    }

    get page(): Page {
        return this.locator.page;
    }

    locate(): Locator {
        return this.locator.locate();
    }

    async isHidden(): Promise<boolean> {
        return this.locate().isHidden();
    }

    async isVisible(): Promise<boolean> {
        return this.locate().isVisible();
    }

    async waitFor(options?: { state?: 'attached' | 'detached' | 'visible' | 'hidden'; timeout?: number }): Promise<void> {
        return this.locate().waitFor(options);
    }

    async waitForHidden(timeout?: number): Promise<void> {
        return this.locate().waitFor({ state: 'hidden', timeout });
    }

    async waitForVisible(timeout?: number): Promise<void> {
        return this.locate().waitFor({ state: 'visible', timeout });
    }

    async bounds(): Promise<InteractableBoundingBox> {
        return interactableBoundsOf(this.locate());
    }
}
