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

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import * as path from 'path';

export type ProjectName = 'standalone' | 'standalone-browser' | 'theia' | 'vscode';

export const PROJECT_REPOS: Record<ProjectName, string> = {
    standalone: 'glsp-client',
    'standalone-browser': 'glsp-client',
    theia: 'glsp-theia-integration',
    vscode: 'glsp-vscode-integration'
};

const DEFAULT_PORTS: Record<string, number> = {
    GLSP_SERVER_PORT: 8081,
    STANDALONE_PORT: 8082,
    STANDALONE_BROWSER_PORT: 8083,
    THEIA_PORT: 3000
};

const NEEDS_GLSP_SERVER = new Set<ProjectName>(['standalone', 'theia', 'vscode']);

export function getRepoDir(): string {
    const dir = process.env.GLSP_REPO_DIR ?? `.repositories`;
    return path.resolve(__dirname, '..', dir);
}

export function getRepoPath(repoName: string): string {
    return path.resolve(getRepoDir(), repoName);
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

function useWebExtension(): boolean {
    return process.env.USE_WEB_EXTENSION === 'true';
}

export function getVsixId(): string {
    return useWebExtension() ? 'eclipse-glsp.workflow-vscode-example-web' : 'eclipse-glsp.workflow-vscode-example';
}

export function findVsixPath(): string {
    const subCommand = useWebExtension() ? 'web-vsix-path' : 'vsix-path';
    return execSync(`yarn --silent glsp repo -d ${getRepoDir()} vscode ${subCommand}`, { encoding: 'utf-8' }).trim();
}

export function getBrowserServerBundlePath(): string {
    const serverRoot = execSync(`yarn --silent glsp repo -d ${getRepoDir()} server-node pwd`, { encoding: 'utf-8' }).trim();
    return path.resolve(serverRoot, 'examples', 'workflow-server-bundled-web', 'wf-glsp-server-webworker.js');
}

function parseRequestedProjects(): ProjectName[] | undefined {
    const args = process.argv;
    const projects: ProjectName[] = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--project' && i + 1 < args.length) {
            const name = args[i + 1];
            projects.push(name === 'vscode-setup' ? 'vscode' : (name as ProjectName));
        } else if (args[i].startsWith('--project=')) {
            const name = args[i].slice('--project='.length);
            projects.push(name === 'vscode-setup' ? 'vscode' : (name as ProjectName));
        }
    }
    return projects.length > 0 ? [...new Set(projects)] : undefined;
}

const EXTRA_REPOS: Partial<Record<ProjectName, string[]>> = {
    'standalone-browser': ['glsp-server-node']
};

function getRequiredRepos(project: ProjectName): string[] {
    return [PROJECT_REPOS[project], ...(EXTRA_REPOS[project] ?? [])];
}

function getMissingRepos(project: ProjectName): string[] {
    return getRequiredRepos(project).filter(repo => !existsSync(getRepoPath(repo)));
}

function isProjectSupported(project: ProjectName): boolean {
    if (project === 'standalone-browser' && (process.env.GLSP_SERVER_TYPE ?? 'node') !== 'node') {
        return false;
    }
    return true;
}

export function getActiveProjects(): ProjectName[] {
    const requested = parseRequestedProjects();
    if (requested) {
        for (const project of requested) {
            if (!PROJECT_REPOS[project]) {
                throw new Error(`Unknown project: "${project}"`);
            }
            if (!isProjectSupported(project)) {
                throw new Error(`Project "${project}" is not supported with server type "${process.env.GLSP_SERVER_TYPE}"`);
            }
            const missing = getMissingRepos(project);
            if (missing.length > 0) {
                const paths = missing.map(r => `"${r}" at ${getRepoPath(r)}`).join(', ');
                throw new Error(`Project "${project}" requires missing repositories: ${paths}`);
            }
        }
        return requested;
    }
    return (Object.keys(PROJECT_REPOS) as ProjectName[]).filter(p => isProjectSupported(p) && getMissingRepos(p).length === 0);
}

export function needsGlspServer(activeProjects: ProjectName[]): boolean {
    return activeProjects.some(p => NEEDS_GLSP_SERVER.has(p));
}
