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
import type { GLSPApp } from '~/glsp/app';

/**
 * Locators represent a way to find element(s) on the page at any moment.
 * They also have access to the {@link GLSPApp}.
 *
 */
export class GLSPLocator {
    constructor(protected readonly locator: Locator, public readonly app: GLSPApp, public readonly parent?: GLSPLocator) {}

    get page(): Page {
        return this.app.page;
    }

    locate(): Locator {
        return this.locator;
    }

    child(selector: string): GLSPLocator {
        return new GLSPLocator(this.locator.locator(selector), this.app, this);
    }

    override(locator: Locator): GLSPLocator {
        return new GLSPLocator(locator, this.app, this.parent);
    }
}
