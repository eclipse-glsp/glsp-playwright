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
import { existsSync } from 'fs';
import { getRepoPath } from './env';

/**
 * Asserts that the GLSP repositories an example package needs have been cloned.
 *
 * Without this the failure surfaces as Playwright's "no tests found", which gives no hint
 * about what to do.
 *
 * @param configDir Directory of the calling `playwright.config.ts`, i.e. `__dirname`
 * @param repos Names of the required repositories
 * @param setupFlag Flag to suggest for `pnpm repo:setup`
 */
export function assertReposPresent(configDir: string, repos: string[], setupFlag: string): void {
    const missing = repos.filter(repo => !existsSync(getRepoPath(configDir, repo)));
    if (missing.length > 0) {
        const paths = missing.map(r => `"${r}" at ${getRepoPath(configDir, r)}`).join(', ');
        throw new Error(`Missing GLSP repositories: ${paths}.\nRun \`pnpm repo:setup ${setupFlag}\` to clone and build them.`);
    }
}
