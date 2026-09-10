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
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { parse, resolve } from 'path';
import { loadEnvFile } from 'process';

export const examplesDir = resolve(import.meta.dirname, '..', 'examples');
const envFile = resolve(examplesDir, '.env');
const envExample = resolve(examplesDir, '.env.example');

export function loadRepoEnv(): void {
    if (existsSync(envFile)) {
        loadEnvFile(envFile);
    }
}

export function getRepoDir(): string {
    const repoDir = resolve(examplesDir, process.env.GLSP_REPO_DIR ?? '.repositories');
    if (repoDir === examplesDir || repoDir === parse(repoDir).root) {
        throw new Error(`Refusing to use unsafe GLSP repository directory: ${repoDir}`);
    }
    return repoDir;
}

export function updateExampleEnv(values: Record<string, string>): void {
    let content = readFileSync(existsSync(envFile) ? envFile : envExample, 'utf-8');
    for (const [key, value] of Object.entries(values)) {
        const entry = `${key}=${value}`;
        const pattern = new RegExp(`^${key}=.*$`, 'm');
        content = pattern.test(content) ? content.replace(pattern, entry) : `${content.trimEnd()}\n${entry}\n`;
    }
    writeFileSync(envFile, content);
}
