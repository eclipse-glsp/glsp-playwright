/********************************************************************************
 * Copyright (c) 2024 EclipseSource and others.
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

import {
    GLSPPlaywrightOptions,
    StandaloneIntegrationOptions,
    TheiaIntegrationOptions,
    VSCodeIntegrationOptions
} from '@eclipse-glsp/glsp-playwright';
import { PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, Project, devices } from '@playwright/test';
import * as path from 'path';
import { getEnv } from './utils';

export function isMultiBrowser(): boolean {
    const env = getEnv('MULTI_BROWSER', false);
    return env === undefined || env === 'true';
}

export function createStandaloneProject(): Project<PlaywrightTestOptions & GLSPPlaywrightOptions, PlaywrightWorkerArgs>[] {
    const url = getEnv('STANDALONE_URL');

    if (url === undefined) {
        console.error(`[Worker: ${process.env.TEST_PARALLEL_INDEX}] Standalone project can not be created.\n`);
        return [];
    }

    const standaloneIntegrationOptions: StandaloneIntegrationOptions = {
        type: 'Standalone',
        url
    };

    const chromeProject = {
        name: 'standalone-chrome',
        testMatch: ['**/*.spec.js'],
        use: {
            ...devices['Desktop Chrome'],
            integrationOptions: standaloneIntegrationOptions
        }
    };

    if (!isMultiBrowser()) {
        return [chromeProject];
    }

    const firefoxProject = {
        name: 'standalone-firefox',
        testMatch: ['**/*.spec.js'],
        use: {
            ...devices['Desktop Firefox'],
            integrationOptions: standaloneIntegrationOptions
        }
    };

    const projects = [chromeProject, firefoxProject];
    if (process.platform === 'win32') {
        const edgeProject = {
            name: 'standalone-edge',
            testMatch: ['**/*.spec.js'],
            use: {
                ...devices['Desktop Edge'],
                integrationOptions: standaloneIntegrationOptions
            }
        };
        projects.push(edgeProject);
    }
    return projects;
}

export function createTheiaProject(): Project<PlaywrightTestOptions & GLSPPlaywrightOptions, PlaywrightWorkerOptions>[] {
    const url = getEnv('THEIA_URL');

    if (url === undefined) {
        console.error(`[Worker: ${process.env.TEST_PARALLEL_INDEX}] Theia project can not be created.\n`);
        return [];
    }

    const theiaIntegrationOptions: TheiaIntegrationOptions = {
        type: 'Theia',
        url,
        widgetId: 'workflow-diagram',
        workspace: '../workspace',
        file: 'example1.wf'
    };

    const chromeProject = {
        name: 'theia-chrome',
        testMatch: ['**/*.spec.js'],
        use: {
            ...devices['Desktop Chrome'],
            baseURL: theiaIntegrationOptions.url,
            integrationOptions: theiaIntegrationOptions
        }
    };

    if (!isMultiBrowser()) {
        return [chromeProject];
    }

    const firefoxProject = {
        name: 'theia-firefox',
        testMatch: ['**/*.spec.js'],
        use: {
            ...devices['Desktop Firefox'],
            baseURL: theiaIntegrationOptions.url,
            integrationOptions: theiaIntegrationOptions
        }
    };

    const projects = [chromeProject, firefoxProject];
    if (process.platform === 'win32') {
        const edgeProject = {
            name: 'theia-edge',
            testMatch: ['**/*.spec.js'],
            use: {
                ...devices['Desktop Edge'],
                baseURL: theiaIntegrationOptions.url,
                integrationOptions: theiaIntegrationOptions
            }
        };
        projects.push(edgeProject);
    }

    return projects;
}

export function createVSCodeProject(): Project<PlaywrightTestOptions & GLSPPlaywrightOptions, PlaywrightWorkerOptions>[] {
    const vsixId = getEnv('VSCODE_VSIX_ID');
    const vsixPath = getEnv('VSCODE_VSIX_PATH');

    if (vsixId === undefined || vsixPath === undefined) {
        console.error(`[Worker: ${process.env.TEST_PARALLEL_INDEX}] VSCode project can not be created.\n`);
        return [];
    }

    const vscodeIntegrationOptions: VSCodeIntegrationOptions = {
        type: 'VSCode',
        workspace: '../workspace',
        file: 'example1.wf',
        vsixId,
        vsixPath,
        storagePath: path.join(__dirname, '../playwright/.storage/vscode.setup.json')
    };

    return [
        {
            name: 'vscode-setup',
            testMatch: ['setup/vscode.setup.js'],
            use: {
                integrationOptions: vscodeIntegrationOptions
            }
        },
        {
            name: 'vscode',
            testMatch: ['**/*.spec.js'],
            dependencies: ['vscode-setup'],
            use: {
                integrationOptions: vscodeIntegrationOptions
            }
        }
    ];
}
