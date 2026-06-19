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
import { execSync } from 'child_process';
import { copyFileSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

const args = process.argv.slice(2);
const java = args.includes('--java');
const skipBuild = args.includes('--skip-build');
const theia = args.includes('--theia');
const standalone = args.includes('--standalone');
const vscode = args.includes('--vscode');

const all = !theia && !standalone && !vscode;

const rootDir = resolve(__dirname, '..');
const repo = 'pnpm glsp repo -d .repositories';

function run(command: string): void {
    console.log(`Running: ${command}`);
    execSync(command, { stdio: 'inherit', cwd: rootDir });
}

const repos: string[] = [];

if (standalone || all) {
    repos.push('glsp-client');
}

if (java) {
    repos.push('glsp-server');
} else {
    repos.push('glsp-server-node');
}

if (theia || all) {
    repos.push('glsp-theia-integration');
}

if (vscode || all) {
    repos.push('glsp-vscode-integration');
}

run(`${repo} clone ${repos.join(' ')}`);

if (!skipBuild) {
    run(`${repo} build`);
    if (repos.includes('glsp-vscode-integration')) {
        run(`${repo} vscode package`);
    }
}

const envExample = resolve(rootDir, '.env.example');
const envFile = resolve(rootDir, '.env');
console.log(`Copying ${envExample} -> ${envFile}`);
copyFileSync(envExample, envFile);

if (java) {
    const content = readFileSync(envFile, 'utf-8');
    writeFileSync(envFile, content.replace(/^GLSP_SERVER_TYPE=.*/m, 'GLSP_SERVER_TYPE=java'));
}
