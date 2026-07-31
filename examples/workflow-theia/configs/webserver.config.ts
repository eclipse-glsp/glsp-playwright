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
import { getPort, getRepoDir } from '@eclipse-glsp/workflow-test/lib/configs/env';
import { buildGlspServerWebServer } from '@eclipse-glsp/workflow-test/lib/configs/glsp-server.config';
import type { PlaywrightTestConfig } from '@playwright/test';

/**
 * The GLSP server plus the Theia browser application.
 *
 * @param configDir Directory of the calling `playwright.config.ts`, i.e. `__dirname`
 */
export function buildWebServers(configDir: string): PlaywrightTestConfig['webServer'] {
    const repo = `pnpm --silent glsp repo -d ${getRepoDir(configDir)}`;
    const glspServerPort = getPort('GLSP_SERVER_PORT');

    return [
        // The GLSP server must come first so Theia starts against a running server.
        buildGlspServerWebServer(configDir),
        {
            command: `${repo} theia run browser exec theia start --WF_GLSP=${glspServerPort} --WF_PATH=workflow --glspDebug`,
            port: getPort('THEIA_PORT'),
            reuseExistingServer: !process.env.CI,
            stdout: 'ignore',
            stderr: 'ignore',
            env: { ...(process.env as Record<string, string>) }
        }
    ];
}
