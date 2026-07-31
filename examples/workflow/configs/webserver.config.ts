/********************************************************************************
 * Copyright (c) 2024-2026 EclipseSource and others.
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

import { PlaywrightTestConfig } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';
import { getPort, getRepoDir } from './env';
import { buildGlspServerWebServer } from './glsp-server.config';
import type { ProjectName } from './project.config';

type WebServerConfig = Extract<NonNullable<PlaywrightTestConfig['webServer']>, unknown[]>[number];

let browserServerBundle: string | undefined;

/**
 * Path of the GLSP server compiled to a web worker, used by the `standalone-browser` project.
 *
 * Resolved lazily and memoized: this shells out to the GLSP CLI, and Playwright re-reads the
 * configuration in every worker, so an eager call would spawn one subprocess per worker — and
 * would require the server repository even for projects that never use the bundle.
 */
function getBrowserServerBundlePath(configDir: string): string {
    if (browserServerBundle === undefined) {
        const serverRoot = execSync(`pnpm --silent glsp repo -d ${getRepoDir(configDir)} server-node pwd`, {
            encoding: 'utf-8'
        }).trim();
        browserServerBundle = path.resolve(serverRoot, 'examples', 'workflow-server-bundled-web', 'wf-glsp-server-webworker.js');
    }
    return browserServerBundle;
}

/**
 * The GLSP server plus the client web servers for the active standalone projects.
 *
 * @param configDir Directory of the calling `playwright.config.ts`, i.e. `__dirname`
 * @param activeProjects Projects the run was started for
 */
export function buildWebServers(configDir: string, activeProjects: ProjectName[]): PlaywrightTestConfig['webServer'] {
    const repo = `pnpm --silent glsp repo -d ${getRepoDir(configDir)}`;
    const glspServerPort = getPort('GLSP_SERVER_PORT');

    // The GLSP server must come first so the client starts against a running server.
    const servers: WebServerConfig[] = [buildGlspServerWebServer(configDir)];

    for (const project of activeProjects) {
        const port = getPort(project === 'standalone' ? 'STANDALONE_PORT' : 'STANDALONE_BROWSER_PORT');
        const command =
            project === 'standalone'
                ? `${repo} client start --external-server --no-open`
                : `${repo} client start --browser --no-open --external-server ${getBrowserServerBundlePath(configDir)}`;

        servers.push({
            command,
            url: `http://localhost:${port}/diagram.html`,
            reuseExistingServer: !process.env.CI,
            stdout: 'ignore',
            stderr: 'ignore',
            env: {
                ...(process.env as Record<string, string>),
                CLIENT_PORT: String(port),
                GLSP_SERVER_PORT: String(glspServerPort)
            }
        });
    }

    return servers;
}
