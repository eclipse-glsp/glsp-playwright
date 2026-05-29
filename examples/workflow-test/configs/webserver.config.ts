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

import * as path from 'path';
import { PlaywrightTestConfig } from '@playwright/test';
import { ProjectName, getPort, getRepoDir, getRepoPath, needsGlspServer } from './utils';

type WebServerConfig = Extract<NonNullable<PlaywrightTestConfig['webServer']>, unknown[]>[number];

const repo = `npx glsp repo -d ${getRepoDir()}`;
const theiaAppDir = path.resolve(getRepoPath('glsp-theia-integration'), 'examples', 'browser-app');

interface ProjectServerConfig {
    command: string;
    port: number;
    env?: Record<string, string>;
    path?: string;
}

const GLSP_SERVER_COMMANDS: Record<string, string> = {
    node: `${repo} server-node start`,
    java: `${repo} server-java start`
};

export function buildWebServers(activeProjects: ProjectName[]): PlaywrightTestConfig['webServer'] {
    const glspServerPort = getPort('GLSP_SERVER_PORT');
    const standalonePort = getPort('STANDALONE_PORT');
    const standaloneBrowserPort = getPort('STANDALONE_BROWSER_PORT');
    const theiaPort = getPort('THEIA_PORT');

    const configs: Partial<Record<ProjectName, ProjectServerConfig>> = {
        standalone: {
            command: `${repo} client start --external-server --no-open`,
            port: standalonePort,
            env: { CLIENT_PORT: String(standalonePort), GLSP_SERVER_PORT: String(glspServerPort) },
            path: '/diagram.html'
        },
        'standalone-browser': {
            command: `${repo} client start --browser --no-open`,
            port: standaloneBrowserPort,
            env: { CLIENT_PORT: String(standaloneBrowserPort) },
            path: '/diagram.html'
        },
        theia: {
            command: `cd ${theiaAppDir} && yarn theia start --WF_GLSP=${glspServerPort} --WF_PATH=workflow --glspDebug`,
            port: theiaPort
        }
    };

    const servers: WebServerConfig[] = [];

    if (needsGlspServer(activeProjects)) {
        const serverType = process.env.GLSP_SERVER_TYPE ?? 'node';
        const serverCommand = GLSP_SERVER_COMMANDS[serverType];
        if (serverCommand) {
            servers.push({
                command: `${serverCommand} --port ${glspServerPort}`,
                port: glspServerPort,
                reuseExistingServer: !process.env.CI,
                stdout: 'ignore'
            });
        }
    }

    for (const project of activeProjects) {
        const cfg = configs[project];
        if (!cfg) {
            continue;
        }
        const readinessCheck: { port: number } | { url: string } = cfg.path
            ? { url: `http://localhost:${cfg.port}${cfg.path}` }
            : { port: cfg.port };
        servers.push({
            command: cfg.command,
            ...readinessCheck,
            reuseExistingServer: !process.env.CI,
            stdout: 'ignore',
            stderr: 'ignore',
            env: { ...(process.env as Record<string, string>), ...cfg.env }
        });
    }

    return servers;
}
