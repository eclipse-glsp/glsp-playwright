/********************************************************************************
 * Copyright (c) 2024 EclipseSource and others.
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

import { GLSPPlaywrightOptions } from '@eclipse-glsp/glsp-playwright';
import { PlaywrightTestConfig } from '@playwright/test';
import { getEnv } from './utils';

export function isManagedServer(): boolean {
    const env = getEnv('GLSP_SERVER_PLAYWRIGHT_MANAGED', false);
    return env === undefined || env === 'true';
}

export function hasRunningServer(config: PlaywrightTestConfig<GLSPPlaywrightOptions>): boolean {
    const webserver = config.webServer;

    const isArray = Array.isArray(webserver);
    return !isManagedServer() || (isArray && webserver.length > 0) || (!isArray && webserver !== undefined);
}

export function createWebserver(): PlaywrightTestConfig['webServer'] {
    if (!isManagedServer()) {
        return [];
    }

    const port = getEnv('GLSP_SERVER_PORT');

    if (port === undefined) {
        console.error('Webserver will be not created.\n');
        return [];
    }

    return [
        {
            command: `yarn start:server -w -p ${+port}`,
            port: +port,
            reuseExistingServer: !process.env.CI,
            stdout: 'ignore'
        }
    ];
}
