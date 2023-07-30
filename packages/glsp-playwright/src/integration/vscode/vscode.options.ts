/********************************************************************************
 * Copyright (c) 2023 EclipseSource and others.
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
import type { BaseIntegrationOptions, IntegrationOptions } from '../integration.type';

export interface VSCodeIntegrationOptions extends BaseIntegrationOptions {
    type: 'VSCode';
    workspace: string;
    vsixId: string;
    vsixPath: string;
    storagePath: string;
    file?: string;
    /*
     * Logs the content of the Electron Application to the console.
     * Disabled by default.
     */
    isConsoleLogEnabled?: boolean;
}

export namespace VSCodeIntegrationOptions {
    export function is(options?: IntegrationOptions): options is VSCodeIntegrationOptions {
        return options?.type === 'VSCode';
    }
}
