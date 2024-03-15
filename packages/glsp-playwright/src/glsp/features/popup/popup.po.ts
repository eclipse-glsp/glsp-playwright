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
import type { GLSPApp } from '~/glsp';
import type { GLSPLocator } from '~/remote';
import { Locateable } from '~/remote/locateable';
import { definedGLSPAttr } from '~/utils/ts.utils';

export interface GLSPPopupOptions {
    locator: GLSPLocator;
}

export class GLSPPopup extends Locateable {
    static locate(app: GLSPApp): GLSPLocator {
        return app.rootLocator.child('[id="sprotty-popup"]');
    }

    constructor(protected readonly options: GLSPPopupOptions) {
        super(options.locator);
    }

    async classAttr(): Promise<string> {
        return definedGLSPAttr(this.locator, 'class');
    }

    async close(): Promise<void> {
        await this.app.graph.select();
        await this.waitForHidden();
    }
}
