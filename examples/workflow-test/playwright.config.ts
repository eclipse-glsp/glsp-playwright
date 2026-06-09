/********************************************************************************
 * Copyright (c) 2023-2026 Business Informatics Group (TU Wien) and others.
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
import { type PlaywrightTestConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import { buildProjects } from './configs/project.config';
import { getActiveProjects } from './configs/utils';
import { buildWebServers } from './configs/webserver.config';

dotenv.config();

const activeProjects = getActiveProjects();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig<GLSPPlaywrightOptions> = {
    testDir: 'lib/tests',
    expect: {
        timeout: 5000
    },
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? [['html', { open: 'never' }], ['@estruyf/github-actions-reporter']] : [['html', { open: 'never' }]],
    use: {
        actionTimeout: 0,
        trace: 'on-first-retry',
        // Emulate `prefers-reduced-motion` so decorative entrance animations and transitions are
        // disabled during tests.
        contextOptions: { reducedMotion: 'reduce' }
    },
    webServer: buildWebServers(activeProjects),
    projects: buildProjects(activeProjects)
};

export default config;
