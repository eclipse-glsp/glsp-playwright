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
import { execFileSync } from 'child_process';
import { examplesDir, getRepoDir, loadRepoEnv, updateExampleEnv } from './repo-env.mts';

loadRepoEnv();

const args = process.argv.slice(2);
const java = args.includes('--java');
const skipBuild = args.includes('--skip-build');
const theia = args.includes('--theia');
const standalone = args.includes('--standalone');
const vscode = args.includes('--vscode');

const all = !theia && !standalone && !vscode;

const repoDir = getRepoDir();

function run(...repoArgs: string[]): void {
    console.log(`Running: pnpm glsp repo -d ${repoDir} ${repoArgs.join(' ')}`);
    execFileSync('pnpm', ['glsp', 'repo', '-d', repoDir, ...repoArgs], { stdio: 'inherit', cwd: examplesDir });
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

run('clone', ...repos);

if (!skipBuild) {
    run('build');
    if (repos.includes('glsp-vscode-integration')) {
        run('vscode', 'package');
    }
}

updateExampleEnv({
    GLSP_REPO_DIR: process.env.GLSP_REPO_DIR ?? '.repositories',
    GLSP_SERVER_TYPE: java ? 'java' : 'node'
});
