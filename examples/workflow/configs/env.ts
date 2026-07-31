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
import * as dotenv from 'dotenv';
import * as path from 'path';

const DEFAULT_PORTS: Record<string, number> = {
    GLSP_SERVER_PORT: 8081,
    STANDALONE_PORT: 8082,
    STANDALONE_BROWSER_PORT: 8083,
    THEIA_PORT: 3000
};

/**
 * Loads the `.env` file shared by all example packages.
 *
 * Anchored on the calling configuration's directory rather than the working directory:
 * `dotenv.config()` without a path reads `<cwd>/.env`, and the working directory differs
 * depending on whether tests are started from the repository root, from the package, or from
 * an IDE. Playwright also re-reads the configuration in every worker, so this runs more than
 * once per test run and must be deterministic.
 *
 * @param configDir Directory of the calling `playwright.config.ts`, i.e. `__dirname`
 */
export function loadEnv(configDir: string): void {
    dotenv.config({ path: path.resolve(configDir, '..', '.env'), quiet: true });
}

/**
 * Directory shared by all example packages that holds the cloned GLSP repositories.
 *
 * @param configDir Directory of the calling `playwright.config.ts`, i.e. `__dirname`
 */
export function getRepoDir(configDir: string): string {
    const examplesDir = path.resolve(configDir, '..');
    const dir = process.env.GLSP_REPO_DIR ?? '.repositories';
    return path.resolve(examplesDir, dir);
}

export function getRepoPath(configDir: string, repoName: string): string {
    return path.resolve(getRepoDir(configDir), repoName);
}

export function getPort(envVar: string): number {
    const val = process.env[envVar];
    if (val) {
        return parseInt(val, 10);
    }
    const defaultPort = DEFAULT_PORTS[envVar];
    if (defaultPort !== undefined) {
        return defaultPort;
    }
    throw new Error(`No default port for ${envVar}`);
}

export function getUrl(portEnvVar: string, urlPath: string = ''): string {
    return `http://localhost:${getPort(portEnvVar)}${urlPath}`;
}

export function getEnv(parameter: string, log: boolean = true): string | undefined {
    const val = process.env[parameter];

    if (log && (val === undefined || val === null)) {
        console.error(`[Worker: ${process.env.TEST_PARALLEL_INDEX}] Parameter "${parameter}" not found in process.env`);
    }
    return val;
}
