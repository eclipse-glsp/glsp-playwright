/********************************************************************************
 * Copyright (c) 2023 Business Informatics Group (TU Wien) and others.
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
import 'reflect-metadata';

import type {
    GLSPPlaywrightOptions,
    StandaloneIntegrationOptions,
    TheiaIntegrationOptions,
    VSCodeIntegrationOptions
} from '@eclipse-glsp/glsp-playwright';
import type { PlaywrightTestConfig } from '@playwright/test';
import { devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getDefined } from './src/utils';

dotenv.config();

const standaloneIntegrationOptions: StandaloneIntegrationOptions = {
    type: 'Standalone',
    url: getDefined(process.env.STANDALONE_URL)
};

const theiaIntegrationOptions: TheiaIntegrationOptions = {
    type: 'Theia',
    url: getDefined(process.env.THEIA_URL),
    widgetId: 'workflow-diagram',
    workspace: '../workspace',
    file: 'example1.wf'
};

const vscodeIntegrationOptions: VSCodeIntegrationOptions = {
    type: 'VSCode',
    workspace: '../workspace',
    file: 'example1.wf',
    vsixId: getDefined(process.env.VSCODE_VSIX_ID),
    vsixPath: getDefined(process.env.VSCODE_VSIX_PATH),
    storagePath: path.join(__dirname, 'playwright/.storage/vscode.setup.json')
};

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig<GLSPPlaywrightOptions> = {
    testDir: 'lib/tests',
    timeout: 30 * 1000,
    expect: {
        timeout: 5000
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [['html', { open: 'never' }]],
    use: {
        actionTimeout: 0,
        trace: 'on-first-retry'
    },
    webServer: [
        {
            command: `yarn start:server -w -p ${+getDefined(process.env.GLSP_SERVER_PORT)}`,
            port: +getDefined(process.env.GLSP_SERVER_PORT),
            reuseExistingServer: !process.env.CI,
            stdout: 'ignore'
        }
    ],
    projects: [
        {
            name: 'standalone',
            testMatch: ['**/*.spec.js'],
            use: {
                ...devices['Desktop Chrome'],
                integrationOptions: standaloneIntegrationOptions
            }
        },
        {
            name: 'theia',
            testMatch: ['**/*.spec.js'],
            use: {
                ...devices['Desktop Chrome'],
                baseURL: theiaIntegrationOptions.url,
                integrationOptions: theiaIntegrationOptions
            }
        },
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
    ]
};

export default config;
