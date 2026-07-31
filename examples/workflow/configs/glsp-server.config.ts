/********************************************************************************
 * Copyright (c) 2026 EclipseSource and others.
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
import type { PlaywrightTestConfig } from '@playwright/test';
import { getPort, getRepoDir } from './env';

type WebServerConfig = Exclude<PlaywrightTestConfig['webServer'], undefined | any[]>;

/**
 * Name of the repository holding the GLSP server for the configured server type.
 *
 * @returns `glsp-server-node` or, for `GLSP_SERVER_TYPE=java`, `glsp-server`
 */
export function getGlspServerRepo(): string {
    return (process.env.GLSP_SERVER_TYPE ?? 'node') === 'java' ? 'glsp-server' : 'glsp-server-node';
}

/**
 * The GLSP server `webServer` entry, needed by every integration.
 *
 * Must come first in the `webServer` array so that the client is started against a running
 * server.
 *
 * @param configDir Directory of the calling `playwright.config.ts`, i.e. `__dirname`
 */
export function buildGlspServerWebServer(configDir: string): WebServerConfig {
    const serverType = process.env.GLSP_SERVER_TYPE ?? 'node';
    const target = serverType === 'java' ? 'server-java' : 'server-node';
    const glspServerPort = getPort('GLSP_SERVER_PORT');

    return {
        command: `pnpm --silent glsp repo -d ${getRepoDir(configDir)} ${target} start --port ${glspServerPort}`,
        port: glspServerPort,
        reuseExistingServer: !process.env.CI,
        stdout: 'ignore'
    };
}
