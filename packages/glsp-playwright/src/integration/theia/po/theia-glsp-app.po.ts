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

import { TheiaApp } from '@theia/playwright';
import type { TheiaIntegrationOptions } from '../theia.options';

/**
 * App for accessing the [Theia Page Objects](https://www.npmjs.com/package/@theia/playwright).
 */
export class TheiaGLSPApp extends TheiaApp {
    protected _options: TheiaIntegrationOptions;

    get options(): TheiaIntegrationOptions {
        return this._options;
    }

    initialize(options: TheiaIntegrationOptions): void {
        this._options = options;
    }
}
