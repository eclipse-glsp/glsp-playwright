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

import type { GLSPPlaywrightOptions } from '@eclipse-glsp/glsp-playwright';
import type { PlaywrightTestConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import { createStandaloneProject, createTheiaProject, createVSCodeProject } from './configs/project.config';
import { createWebserver, hasRunningServer } from './configs/webserver.config';

dotenv.config();

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
    reporter: process.env.CI ? [['html', { open: 'never' }], ['@estruyf/github-actions-reporter'],
    ['list']] : [['html', { open: 'never' }]],
    use: {
        actionTimeout: 0,
        trace: 'on-first-retry'
    },
    webServer: createWebserver(),
    projects: []
};

if (hasRunningServer(config)) {
    config.projects = [...createStandaloneProject(), ...createTheiaProject(), ...createVSCodeProject()];
}

export default config;
