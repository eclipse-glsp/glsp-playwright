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

import {
    GLSPPlaywrightOptions,
    StandaloneIntegrationOptions,
    TheiaIntegrationOptions,
    VSCodeIntegrationOptions
} from '@eclipse-glsp/glsp-playwright';
import { PlaywrightTestOptions, PlaywrightWorkerArgs, PlaywrightWorkerOptions, Project, devices } from '@playwright/test';
import * as path from 'path';
import { ProjectName, findVsixPath, getUrl, getVsixId } from './utils';

const projectDevices = devices['Desktop Chrome'];

function createStandaloneProject(): Project<PlaywrightTestOptions & GLSPPlaywrightOptions, PlaywrightWorkerArgs>[] {
    const standaloneIntegrationOptions: StandaloneIntegrationOptions = {
        type: 'Standalone',
        url: getUrl('STANDALONE_PORT', '/diagram.html')
    };

    return [
        {
            name: 'standalone',
            testMatch: ['**/*.spec.js'],
            use: {
                ...projectDevices,
                integrationOptions: standaloneIntegrationOptions
            }
        }
    ];
}

function createStandaloneBrowserProject(): Project<PlaywrightTestOptions & GLSPPlaywrightOptions, PlaywrightWorkerArgs>[] {
    const standaloneIntegrationOptions: StandaloneIntegrationOptions = {
        type: 'Standalone',
        url: getUrl('STANDALONE_BROWSER_PORT', '/diagram.html')
    };

    return [
        {
            name: 'standalone-browser',
            testMatch: ['**/*.spec.js'],
            use: {
                ...projectDevices,
                integrationOptions: standaloneIntegrationOptions
            }
        }
    ];
}

function createTheiaProject(): Project<PlaywrightTestOptions & GLSPPlaywrightOptions, PlaywrightWorkerOptions>[] {
    const theiaIntegrationOptions: TheiaIntegrationOptions = {
        type: 'Theia',
        url: getUrl('THEIA_PORT'),
        widgetId: 'workflow-diagram',
        workspace: '../workspace',
        file: 'example1.wf'
    };

    return [
        {
            name: 'theia',
            timeout: 60 * 1000,
            testMatch: ['**/*.spec.js'],
            testIgnore: ['**/*.standalone.spec.js'],
            use: {
                ...projectDevices,
                baseURL: theiaIntegrationOptions.url,
                integrationOptions: theiaIntegrationOptions
            }
        }
    ];
}

function createVSCodeProject(): Project<PlaywrightTestOptions & GLSPPlaywrightOptions, PlaywrightWorkerOptions>[] {
    const vscodeIntegrationOptions: VSCodeIntegrationOptions = {
        type: 'VSCode',
        workspace: '../workspace',
        file: 'example1.wf',
        vsixId: getVsixId(),
        vsixPath: findVsixPath(),
        storagePath: path.join(__dirname, '../playwright/.storage/vscode.setup.json')
    };

    return [
        {
            name: 'vscode-setup',
            timeout: 5 * 60 * 1000,
            testMatch: ['setup/vscode.setup.js'],
            use: {
                integrationOptions: vscodeIntegrationOptions
            }
        },
        {
            name: 'vscode',
            timeout: 60 * 1000,
            testMatch: ['**/*.spec.js'],
            testIgnore: ['**/*.standalone.spec.js'],
            dependencies: ['vscode-setup'],
            use: {
                integrationOptions: vscodeIntegrationOptions
            }
        }
    ];
}

export function buildProjects(
    activeProjects: ProjectName[]
): Project<PlaywrightTestOptions & GLSPPlaywrightOptions, PlaywrightWorkerArgs | PlaywrightWorkerOptions>[] {
    return activeProjects.flatMap(project => {
        switch (project) {
            case 'standalone':
                return createStandaloneProject();
            case 'standalone-browser':
                return createStandaloneBrowserProject();
            case 'theia':
                return createTheiaProject();
            case 'vscode':
                return createVSCodeProject();
        }
    });
}
