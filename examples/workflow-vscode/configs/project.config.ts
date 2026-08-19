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
import type { GLSPPlaywrightOptions } from '@eclipse-glsp/playwright';
import { defineVSCodeIntegration } from '@eclipse-glsp/playwright-vscode';
import { STANDALONE_ONLY } from '@eclipse-glsp/workflow-test/lib/configs/base.config';
import { getRepoDir } from '@eclipse-glsp/workflow-test/lib/configs/env';
import { PlaywrightTestOptions, PlaywrightWorkerOptions, Project } from '@playwright/test';
import { execSync } from 'child_process';
import * as path from 'path';

/**
 * Directory holding the integration-agnostic specs, owned by `@eclipse-glsp/workflow-test`.
 *
 * A plain relative path rather than the `node_modules` symlink: Playwright derives a test's
 * reported location from the realpath of the loaded module but keeps the collected path for the
 * suite title, so going through the symlink would desynchronize the two and break report
 * grouping and `playwright test <file>` filtering.
 */
export const SHARED_TEST_DIR = '../workflow/lib/tests';

function useWebExtension(): boolean {
    return process.env.USE_WEB_EXTENSION === 'true';
}

function getVsixId(): string {
    return useWebExtension() ? 'eclipse-glsp.workflow-vscode-example-web' : 'eclipse-glsp.workflow-vscode-example';
}

let vsixPath: string | undefined;

/**
 * Resolved lazily and memoized: this shells out to the GLSP CLI, and Playwright re-reads the
 * configuration in every worker, so an eager call would spawn one subprocess per worker.
 */
function findVsixPath(configDir: string): string {
    if (vsixPath === undefined) {
        const subCommand = useWebExtension() ? 'web-vsix-path' : 'vsix-path';
        vsixPath = execSync(`pnpm --silent glsp repo -d ${getRepoDir(configDir)} vscode ${subCommand}`, {
            encoding: 'utf-8'
        }).trim();
    }
    return vsixPath;
}

export function buildProjects(configDir: string): Project<PlaywrightTestOptions & GLSPPlaywrightOptions, PlaywrightWorkerOptions>[] {
    const integrationOptions = defineVSCodeIntegration({
        workspace: '../workspace',
        file: 'example1.wf',
        vsixId: getVsixId(),
        vsixPath: findVsixPath(configDir),
        // `configDir` is the package root (the directory of `playwright.config.ts`), so this
        // stays inside the package.
        storagePath: path.join(configDir, 'playwright/.storage/vscode.setup.json')
    });

    return [
        // Downloads VS Code and installs the extension under test. The `vscode` project depends
        // on it, so it always runs first; the two form one unit.
        {
            name: 'vscode-setup',
            timeout: 5 * 60 * 1000,
            testDir: 'lib/tests',
            testMatch: ['setup/vscode.setup.js'],
            use: { integrationOptions }
        },
        {
            name: 'vscode',
            timeout: 60 * 1000,
            testDir: SHARED_TEST_DIR,
            testMatch: ['**/*.spec.js'],
            testIgnore: [
                ...STANDALONE_ONLY,
                // TODO: Keyboard event not handled in VS Code
                '**/features/undo-redo/undo-redo.spec.js',
                // VS Code has no support for marker navigation
                '**/features/validation/marker-navigator.spec.js'
            ],
            dependencies: ['vscode-setup'],
            use: { integrationOptions }
        }
    ];
}
